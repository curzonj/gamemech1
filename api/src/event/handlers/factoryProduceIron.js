const db = require('../../models');

module.exports = {
  factoryProduceIron: {
    complete({ game_account_id }, t) {
      return db.assets.upsertOnConflict(
        {
          game_account_id,
          type: 'iron',
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
