const db = require('../../models');

module.exports = {
  factoryProduceIron: {
    complete(details, t) {
      return db.assets.upsertOnConflict(
        {
          id: 'iron',
          amount: 1,
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
