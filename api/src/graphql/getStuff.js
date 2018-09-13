import { gqlAuthd } from '../utils';

const db = require('../models');

const getStuff = gqlAuthd(async req => {
  const ironId = await db.type.findIdByName('iron');

  const asset = await db.asset.upsertOnConflict({
    gameAccountId: req.user.id,
    typeId: ironId,
    quantity: 1,
  });

  return asset;
});

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
