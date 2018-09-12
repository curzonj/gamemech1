module.exports = function(sequelize, DataTypes) {
  const model = sequelize.define(
    'assets',
    {
      type: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      game_account_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      amount: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: false,
    }
  );

  model.removeAttribute('id');

  model.typeDefs = `
        type Asset {
            game_account_id: Int
            type: String
            amount: Int
        }

        extend type Query {
            assets: [Asset]
        }
    `;
  model.resolvers = {
    Query: {
      assets: () => model.findAll(),
    },
  };

  model.upsertOnConflict = function(values, opts = {}) {
    opts.replacements = values;
    opts.model = model;

    return sequelize.query(
      'INSERT INTO assets (game_account_id, type, amount) VALUES (:game_account_id, :type, :amount) ON CONFLICT (game_account_id, type) DO UPDATE SET amount = assets.amount + EXCLUDED.amount RETURNING *',
      opts
    );
  };

  return model;
};
