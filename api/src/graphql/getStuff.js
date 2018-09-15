import gqlAuth from '../utils/gqlAuth';
import * as db from '../models';
import addAsset from '../utils/addAsset';

const getStuff = gqlAuth(async req => {
  const ironId = await db.type.findIdByName('iron');

  const asset = await addAsset(req.user.id, ironId, 1);

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
