const db = require('../models');

exports.typeDefs = `
  extend type Mutation {
    getStuff: Asset
  }
`;

exports.resolvers = {
  Mutation: {
    getStuff,
  },
};

function getStuff(root, args, req, info) {
  if (!req.user) {
    return;
  }

  return db.assets
    .upsertOnConflict({
      game_account_id: req.user.id,
      type: 'iron',
      amount: 1,
    })
    .then(list => list[0]);
}
