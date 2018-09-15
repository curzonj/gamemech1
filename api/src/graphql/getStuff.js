import gqlAuth from '../utils/gqlAuth';
import * as db from '../models';
import addAsset from '../utils/addAsset';

const getStuff = gqlAuth(async req => {
  const { id: ironId } = await db.type.findByName('iron', 'asset');

  const asset = await addAsset(req.user.id, 0, ironId, 1);

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
