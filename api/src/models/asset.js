import gqlAuth from '../utils/gqlAuth';

module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'asset',
    {
      typeId: {
        type: DataTypes.BIGINT,
        primaryKey: true,
      },
      typeGroupId: {
        type: DataTypes.BIGINT,
      },
      locationId: {
        type: DataTypes.BIGINT,
        primaryKey: true,
      },
      gameAccountId: {
        type: DataTypes.BIGINT,
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
        id: ID
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
      id: gqlAuth((req, args, root) => `${root.typeId}-${root.locationId}`),
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
      'INSERT INTO assets (game_account_id, location_id, type_id, type_group_id, quantity) VALUES (:gameAccountId, :locationId, :typeId, :typeGroupId, :quantity) ON CONFLICT (game_account_id, location_id, type_id) DO UPDATE SET quantity = assets.quantity + EXCLUDED.quantity RETURNING *',
      opts
    );
  };

  return model;
};
