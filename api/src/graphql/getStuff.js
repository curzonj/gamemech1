import gqlAuth from '../utils/gqlAuth';
import * as db from '../models';
import addAsset from '../utils/addAsset';

exports.typeDefs = `
  extend type Mutation {
    getStuff: Asset
  }
`;

// TODO replace this with a generic data driven loot table endpoint

exports.resolvers = {
  Mutation: {
    getStuff: gqlAuth(async req => {
      const { id: ironId } = await db.type.findByName('iron', 'material');

      const asset = await addAsset(
        req.user.id,
        db.location.EverywhereId,
        ironId,
        1
      );

      return asset;
    }),
  },
};
