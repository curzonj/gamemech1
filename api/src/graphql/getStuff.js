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

function getStuff() {
  return db.assets
    .upsertOnConflict({
      id: 'iron',
      amount: 1,
    })
    .then(list => list[0]);
}
