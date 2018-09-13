import { gqlAuthd } from '../utils';
import { unblock } from '../events/utils';

const db = require('../models');

const { sequelize } = db;

const convertStuff = gqlAuthd(async req => {
  const gameAccountId = req.user.id;

  const ironId = await db.type.findIdByName('iron');
  const toolsId = await db.type.findIdByName('tools');

  const tools = await sequelize.transaction(async t => {
    const a = await db.asset.findOne(
      {
        where: {
          gameAccountId,
          typeId: ironId,
        },
      },
      {
        transaction: t,
        lock: t.LOCK.UPDATE,
      }
    );

    if (a.quantity < 10) {
      throw new Error('Not enough inputs');
    }

    await a.update({ quantity: a.quantity - 10 }, { transaction: t });

    return db.asset.upsertOnConflict(
      {
        gameAccountId,
        typeId: toolsId,
        quantity: 1,
      },
      {
        transaction: t,
      }
    );
  });

  await unblock(toolsId, null, tools.quantity);

  return tools;
});

exports.typeDefs = `
  extend type Mutation {
    convertStuff: Asset
  }
`;

exports.resolvers = {
  Mutation: {
    convertStuff,
  },
};
