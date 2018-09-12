const db = require('../models');

const sequelize = db.sequelize;
const { unblock } = require('../event/utils');

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

async function convertStuff(root, args, req, info) {
  if (!req.user) {
    return;
  }

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
}
