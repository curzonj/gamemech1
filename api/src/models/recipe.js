module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'recipe',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
      },
      facilityTypeId: {
        type: DataTypes.BIGINT,
      },
      duration: {
        type: DataTypes.INTEGER,
      },
      manual: {
        type: DataTypes.BOOLEAN,
      },
      dependencyIds: {
        type: DataTypes.ARRAY(DataTypes.BIGINT),
      },
      consumableIds: {
        type: DataTypes.ARRAY(DataTypes.BIGINT),
      },
      resultIds: {
        type: DataTypes.ARRAY(DataTypes.BIGINT),
      },
      resultStyle: {
        type: DataTypes.STRING,
      },
      resultHandler: {
        type: DataTypes.STRING,
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
    type Recipe {
      id: ID!
      facilityType: Type
      dependencyTypes: [Type]
      consumableTypes: [Type]
      resultTypes: [Type]
      resultStyle: String
      resultHandler: String
      manual: Boolean
      duration: Int
      details: JSON
    }

    extend type Query {
      recipe(id: ID!): Recipe
      recipes: [Recipe]
    }
  `;
  model.resolvers = {
    Recipe: {
      facilityType: (root, args, req) =>
        model.db.type.dataloader(req).load(root.facilityTypeId),
      dependencyTypes: (root, args, req) =>
        Promise.all(
          root.dependencyIds.map(n => model.db.type.dataloader(req).load(n))
        ),
      consumableTypes: (root, args, req) =>
        Promise.all(
          root.consumableIds.map(n => model.db.type.dataloader(req).load(n))
        ),
      resultTypes: (root, args, req) =>
        Promise.all(
          root.resultIds.map(n => model.db.type.dataloader(req).load(n))
        ),
    },
    Query: {
      recipe: (root, args) => model.findById(args.id),
      recipes: () => model.findAll(),
    },
  };

  model.prototype.facilityType = function type() {
    return model.db.type.findById(this.facilityTypeId);
  };

  return model;
};
