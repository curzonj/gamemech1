const db = require('../../models');

module.exports = {
  async complete({ gameAccountId }, t, now) {
    const triggerAt = new Date(now);
    triggerAt.setSeconds(triggerAt.getSeconds() + 120);

    const factoryId = await db.type.findIdByName('factory');

    return Promise.all([
      db.asset.upsertOnConflict(
        {
          gameAccountId,
          typeId: factoryId,
          quantity: 1,
        },
        {
          transaction: t,
        }
      ),
      db.timer.create(
        {
          gameAccountId,
          triggerAt,
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

  async prepare({ gameAccountId }, t) {
    const toolsId = await db.type.findIdByName('tools');

    const a = await db.asset.findOne(
      {
        where: {
          gameAccountId,
          typeId: toolsId,
        },
      },
      {
        transaction: t,
        lock: t.LOCK.UPDATE,
      }
    );

    if (a === null || a.quantity < 10) {
      return {
        reqs: {
          typeId: toolsId,
          container: null,
          quantity: 10,
        },
      };
    }

    await a.update(
      {
        quantity: a.quantity - 10,
      },
      {
        transaction: t,
      }
    );

    return {
      duration: 120,
    };
  },
};
