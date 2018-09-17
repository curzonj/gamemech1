import * as gameHandlers from './handlers';
import * as db from '../models';
import safe from '../shared/try_catch';

const {
  sequelize,
  Sequelize: { Op },
} = db;

export function nextAt(duration, from = new Date()) {
  const next = new Date(from);
  next.setSeconds(next.getSeconds() + duration);

  return next;
}

export async function invokeHandler(name, job, t) {
  const fn = safe(() => gameHandlers[job.handler][name], () => undefined);
  return fn(job, t);
}

export async function unblock(
  blockedTypeId,
  blockedContainerId,
  blockedQuantity,
  now = new Date()
) {
  const blocked = await db.timerQueue.findAll({
    attributes: ['gameAccountId', 'assetInstanceId'],
    where: {
      blockedTypeId,
      blockedContainerId,
      blockedQuantity: {
        [Op.lte]: blockedQuantity,
      },
    },
  });

  // Check the queues serially because most likely the first queue in the list
  // will consume enough resources that the rest will remain blocked
  return blocked.reduce(async (prev, { gameAccountId, assetInstanceId }) => {
    await prev;

    await sequelize.transaction(async t => {
      const queue = await db.timerQueue.findLocked(
        gameAccountId,
        assetInstanceId,
        t
      );

      const next = await db.timer.findOne(
        {
          where: {
            gameAccountId: queue.gameAccountId,
            assetInstanceId: queue.assetInstanceId,
            listHead: true,
          },
        },
        {
          transaction: t,
          lock: t.LOCK.UPDATE,
        }
      );

      if (next === null) {
        return;
      }

      const { duration } = await invokeHandler('prepare', next, t);
      if (duration) {
        await next.update(
          {
            triggerAt: nextAt(duration, now),
          },
          {
            transaction: t,
          }
        );

        await queue.update(
          {
            blockedTypeId: null,
            blockedQuantity: null,
          },
          {
            transaction: t,
          }
        );
      }
    });
  }, Promise.resolve());
}

export async function prepareJobToRun(queue, job, t, now = new Date()) {
  const values = {
    listHead: true,
  };

  const { duration, reqs } = await invokeHandler('prepare', job, t);

  if (duration) {
    // We set the value because we don't know if it's an object
    values.triggerAt = nextAt(duration, now);
  } else {
    if (!queue) {
      throw new Error(
        `invalid prepare handler without queue: ${JSON.stringify(job)}`
      );
    }

    await queue.update(
      {
        blockedTypeId: reqs.typeId,
        blockedQuantity: reqs.quantity,
      },
      {
        transaction: t,
      }
    );
  }

  await job.update(values, { transaction: t });
}

export async function createTimer(values, t, now) {
  const job = await db.timer.create(values, { transaction: t });
  await prepareJobToRun(null, job, t, now);
}

export function schedule({ handler, gameAccountId, assetInstanceId, details }) {
  return sequelize.transaction(async t => {
    const facility = await db.assetInstance.findById(assetInstanceId, {
      transaction: t,
    });

    const queue = await db.timerQueue.findOrCreateLocked(
      gameAccountId,
      assetInstanceId,
      facility.locationId,
      t
    );

    const last = await db.timer.findOne(
      {
        where: {
          gameAccountId,
          assetInstanceId,
          nextId: null,
        },
      },
      {
        transaction: t,
        lock: t.LOCK.UPDATE,
      }
    );

    const job = await db.timer.create(
      {
        handler,
        gameAccountId,
        assetInstanceId,
        details,
      },
      {
        transaction: t,
      }
    );

    if (last) {
      await last.update(
        {
          nextId: job.id,
        },
        {
          transaction: t,
        }
      );
    } else {
      await prepareJobToRun(queue, job, t);
    }

    return job;
  });
}
