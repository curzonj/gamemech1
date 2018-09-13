import safe from '../shared/try_catch';

module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'gameAccount',
    {
      type: {
        type: DataTypes.STRING,
      },
      details: {
        type: DataTypes.JSONB,
      },
    },
    {
      tableName: 'game_accounts',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  model.typeDefs = `
        extend type Query {
            account(id: ID): GameAccount
            accounts: [GameAccount]
        }

        type GameAccount {
            id: ID!
            details: GameAccountDetails
        }

        type GameAccountDetails {
            nickname: String
        }
    `;

  model.resolvers = {
    Query: {
      account: (root, args, req, info) => {
        const id = safe(() => args.id);
        return id ? model.findById(id) : req.user;
      },
      accounts: () => model.findAll(),
    },
  };

  return model;
};
