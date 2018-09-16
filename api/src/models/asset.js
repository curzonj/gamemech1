import gqlAuth from '../utils/gqlAuth';

module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'asset',
    {
      typeId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      locationId: {
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

  model.typeDefs = `
      input AssetQuantityInput {
        id: ID!
        quantity: Int!
      }

      type Asset {
        type: Type
        location: Location
        quantity: Int
      }

      extend type Query {
        assets: [Asset]
      }
    `;

  model.resolvers = {
    Asset: {
      type: gqlAuth((req, args, root) =>
        model.db.type.dataloader(req).load(root.typeId)
      ),
      location: gqlAuth((req, args, root) =>
        model.db.location.dataloader(req).load(root.locationId)
      ),
    },
    Query: {
      assets: gqlAuth(req =>
        model.findAll({
          where: { gameAccountId: req.user.id },
        })
      ),
    },
  };

  model.upsertOnConflict = function upsertOnConflict(values, opts = {}) {
    opts.replacements = values;
    opts.model = model;
    opts.mapToModel = true;
    opts.plain = true;

    return sequelize.query(
      'INSERT INTO assets (game_account_id, location_id, type_id, quantity) VALUES (:gameAccountId, :locationId, :typeId, :quantity) ON CONFLICT (game_account_id, location_id, type_id) DO UPDATE SET quantity = assets.quantity + EXCLUDED.quantity RETURNING *',
      opts
    );
  };

  return model;
};
