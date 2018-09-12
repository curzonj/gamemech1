const db = require('../../models');

module.exports = {
  doneBuilding: {
    complete({ game_account_id }, t, now) {
      const trigger_at = new Date(now);
      trigger_at.setSeconds(trigger_at.getSeconds() + 120);

      return Promise.all([
        db.assets.upsertOnConflict(
          {
            game_account_id,
            type: 'factory',
            amount: 1,
          },
          {
            transaction: t,
          }
        ),
        db.timers.create(
          {
            game_account_id,
            trigger_at,
            handler: 'factoryProduceIron',
            interval_seconds: 120,
            details: {},
          },
          {
            transaction: t,
          }
        ),
      ]);
    },

    async prepare({ game_account_id }, t) {
      const a = await db.assets.findOne(
        {
          where: {
            game_account_id,
            type: 'tools',
          },
        },
        {
          transaction: t,
          lock: t.LOCK.UPDATE,
        }
      );

      if (a === null || a.amount < 10) {
        return {
          reqs: {
            type: 'tools',
            container: null,
            quantity: 10,
          },
        };
      }

      await a.update(
        {
          amount: a.amount - 10,
        },
        {
          transaction: t,
        }
      );

      return {
        duration: 120,
      };
    },
  },
};
