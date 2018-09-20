import gqlAuth from '../utils/gqlAuth';

module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'site',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      typeId: {
        type: DataTypes.BIGINT,
      },
      locationId: {
        type: DataTypes.BIGINT,
      },
      assetInstanceId: {
        type: DataTypes.BIGINT,
      },
      public: {
        type: DataTypes.BOOLEAN,
      },
      details: {
        type: DataTypes.JSONB,
      },
    },
    {
      timestamps: false,
    }
  );

  model.typeDefs = `
      type Site {
        id: ID!
        type: Type
        location: Location
        public: Boolean
        details: JSON
      }

      extend type Query {
        sites: [Site]
      }
    `;

  model.resolvers = {
    Site: {
      type: gqlAuth((req, args, root) =>
        model.db.type.dataloader(req).load(root.typeId)
      ),
      location: gqlAuth((req, args, root) =>
        model.db.location.dataloader(req).load(root.locationId)
      ),
    },
    Query: {
      sites: gqlAuth(req => model.findAll()),
    },
  };

  return model;
};
