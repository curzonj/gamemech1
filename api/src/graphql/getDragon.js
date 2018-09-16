import gqlAuth from '../utils/gqlAuth';
import * as db from '../models';
import addAsset from '../utils/addAsset';

const getDragon = gqlAuth(async req => {
  const { details } = await db.lootTable.selectFromTable('dragons');
  const typeName =
    details.list[Math.floor(Math.random() * details.list.length)];
  const { id: typeId } = await db.type.findByName(typeName, 'asset');

  const asset = await addAsset(req.user.id, 0, typeId, 1);

  return asset;
});

exports.typeDefs = `
  extend type Mutation {
    getDragon: Asset
  }
`;

exports.resolvers = {
  Mutation: {
    getDragon,
  },
};
