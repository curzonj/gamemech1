const gameHandlers = require('./handlers');
const db = require('../models');

const Op = db.Sequelize.Op;
const sequelize = db.sequelize;

const self = (module.exports = {
  async invokeHandler(
    name,
    { handler, game_account_id, details, trigger_at },
    t
  ) {
    const fns = gameHandlers[handler];

    if (fns[name] === undefined) {
      return;
    }

    const copy = Object.assign({}, details, { game_account_id });

    switch (name) {
      case 'prepare':
        return await fns.prepare(copy, t);
      case 'complete':
        return await fns.complete(copy, t, trigger_at);
      case 'reschedule':
        return await fns.reschedule(copy, t);
      default:
        throw new Error('unsupported handler operation');
    }
  },

  async unblock(type, container, quantity, now = new Date()) {
    const blocked = await db.timer_queues.findAll({
      attributes: ['id'],
      where: {
        blocked_type: type,
        blocked_container: container,
        blocked_quantity: {
          [Op.lte]: quantity,
        },
      },
    });

    for (const { id } of blocked) {
      await sequelize.transaction(async t => {
        const queue = await db.timer_queues.findById(id, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        const next = await db.timers.findOne(
          {
            where: {
              queue_id: queue.id,
              list_head: true,
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

        const { duration } = await self.invokeHandler('prepare', next, t);
        if (duration) {
          await next.update(
            {
              trigger_at: self.nextAt(duration, now),
            },
            {
              transaction: t,
            }
          );

          await queue.update(
            {
              blocked_type: null,
              blocked_container: null,
              blocked_quantity: null,
            },
            {
              transaction: t,
            }
          );
        }
      });
    }
  },

  async prepareJobToRun(queue, job, t, now = new Date()) {
    const values = {
      list_head: true,
    };

    const { duration, reqs } = await self.invokeHandler('prepare', job, t);

    if (duration) {
      // We set the value because we don't know if it's an object
      values.trigger_at = self.nextAt(duration, now);
    } else {
      await queue.update(
        {
          blocked_type: reqs.type,
          blocked_container: reqs.container,
          blocked_quantity: reqs.quantity,
        },
        {
          transaction: t,
        }
      );
    }

    await job.update(values, { transaction: t });
  },

  schedule({ handler, game_account_id, queue_id, details }) {
    return sequelize.transaction(async t => {
      const queue = await db.timer_queues.findById(queue_id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      const last = await db.timers.findOne(
        {
          where: {
            queue_id,
            next_id: null,
          },
        },
        {
          transaction: t,
          lock: t.LOCK.UPDATE,
        }
      );

      const job = await db.timers.create(
        {
          handler,
          game_account_id,
          queue_id,
          details,
        },
        {
          transaction: t,
        }
      );

      if (last) {
        await last.update(
          {
            next_id: job.id,
          },
          {
            transaction: t,
          }
        );
      } else {
        await self.prepareJobToRun(queue, job, t);
      }

      return job;
    });
  },

  nextAt(duration, from = new Date()) {
    const next = new Date(from);
    next.setSeconds(next.getSeconds() + duration);

    return next;
  },
});
