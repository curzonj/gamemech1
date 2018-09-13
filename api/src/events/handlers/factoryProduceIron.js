const db = require('../../models');

module.exports = {
  factoryProduceIron: {
    async complete({ gameAccountId }, t) {
      const ironId = await db.type.findIdByName('iron');

      return db.asset.upsertOnConflict(
        {
          gameAccountId,
          typeId: ironId,
          quantity: 1,
        },
        {
          transaction: t,
        }
      );
    },
    reschedule(details, t) {
      return 120;
    },
  },
};
