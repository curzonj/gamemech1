import { gqlAuthd } from '../utils';

module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'asset',
    {
      typeId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      gameAccountId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: false,
    }
  );

  model.removeAttribute('id');

  model.associate = function associate(db) {
    this.db = db;
  };

  model.typeDefs = `
      input AssetQuantityInput {
        id: ID!
        quantity: Int!
      }

      type Asset {
        type: Type
        quantity: Int
      }

      extend type Query {
        assets: [Asset]
      }
    `;
  model.resolvers = {
    Query: {
      assets: gqlAuthd(req =>
        model.findAll({
          where: { gameAccountId: req.user.id },
        })
      ),
    },
  };

  model.prototype.type = function type() {
    return model.db.type.findById(this.typeId);
  };

  model.upsertOnConflict = function upsertOnConflict(values, opts = {}) {
    opts.replacements = values;
    opts.model = model;
    opts.mapToModel = true;
    opts.plain = true;

    return sequelize.query(
      'INSERT INTO assets (game_account_id, type_id, quantity) VALUES (:gameAccountId, :typeId, :quantity) ON CONFLICT (game_account_id, type_id) DO UPDATE SET quantity = assets.quantity + EXCLUDED.quantity RETURNING *',
      opts
    );
  };

  return model;
};
