import * as gameHandlers from './handlers';
import * as db from '../models';
import safe from '../shared/try_catch';
import { each } from '../shared/async';

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
  await each(blocked, async ({ gameAccountId, assetInstanceId }) =>
    sequelize.transaction(async transaction => {
      const queue = await db.timerQueue.findLocked(
        gameAccountId,
        assetInstanceId,
        transaction
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
          transaction,
          lock: transaction.LOCK.UPDATE,
        }
      );

      if (next === null) {
        return;
      }

      const { duration } = await invokeHandler('prepare', next, transaction);
      if (duration) {
        await next.update(
          { triggerAt: nextAt(duration, now) },
          { transaction }
        );

        await queue.update(
          { blockedTypeId: null, blockedQuantity: null },
          { transaction }
        );
      }
    })
  );
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

    values.triggerAt = null;

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

export class QueuingNotAllowed extends Error {
  constructor(message = 'This job cannot be queued, please wait', ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(message, ...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, QueuingNotAllowed);
    }
  }
}

export async function scheduleTimer(queue, job, disallowQueuing, t) {
  const { gameAccountId, assetInstanceId } = queue;

  const last = await db.timer.findOne({
    where: {
      id: { [Op.ne]: job.id },
      gameAccountId,
      assetInstanceId,
      nextId: null,
    },
    transaction: t,
    lock: t.LOCK.UPDATE,
  });

  if (last) {
    if (disallowQueuing) {
      throw new QueuingNotAllowed();
    }

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
}
