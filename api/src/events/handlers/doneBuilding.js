import addAsset from '../../utils/addAsset';
import * as db from '../../models';

module.exports = {
  async complete({ gameAccountId }, t, now) {
    const triggerAt = new Date(now);
    triggerAt.setSeconds(triggerAt.getSeconds() + 120);

    const { id: factoryId } = await db.type.findByName('factory', 'asset');

    return Promise.all([
      addAsset(gameAccountId, 0, factoryId, 1, t),
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
    const { id: toolsId } = await db.type.findByName('tools', 'asset');

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
