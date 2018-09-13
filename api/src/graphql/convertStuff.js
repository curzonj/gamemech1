import { gqlAuthd } from '../utils';

const db = require('../models');

const sequelize = db.sequelize;
const { unblock } = require('../event/utils');

const convertStuff = gqlAuthd(async req => {
  const game_account_id = req.user.id;

  const tools = await sequelize.transaction(async t => {
    const a = await db.assets.findOne(
      {
        where: {
          game_account_id,
          type: 'iron',
        },
      },
      {
        transaction: t,
        lock: t.LOCK.UPDATE,
      }
    );

    if (a.amount < 10) {
      throw new Error('Not enough inputs');
    }

    return Promise.all([
      a.update(
        {
          amount: a.amount - 10,
        },
        {
          transaction: t,
        }
      ),
      db.assets.upsertOnConflict(
        {
          game_account_id,
          type: 'tools',
          amount: 1,
        },
        {
          transaction: t,
        }
      ),
    ]).then(([iron, [tools]]) => tools);
  });

  await unblock('tools', null, tools.amount);

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
