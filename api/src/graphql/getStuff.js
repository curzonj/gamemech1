import { gqlAuthd } from '../utils';

const db = require('../models');

const getStuff = gqlAuthd(req =>
  db.assets
    .upsertOnConflict({
      game_account_id: req.user.id,
      type: 'iron',
      amount: 1,
    })
    .then(list => list[0])
);

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
