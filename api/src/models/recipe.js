module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'recipe',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      facilityTypeId: {
        type: DataTypes.BIGINT,
      },
      duration: {
        type: DataTypes.INTEGER,
      },
      dependencies: {
        type: DataTypes.ARRAY(DataTypes.BIGINT),
      },
      consumables: {
        type: DataTypes.ARRAY(DataTypes.BIGINT),
      },
      outputs: {
        type: DataTypes.ARRAY(DataTypes.BIGINT),
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
      dependencies: JSON,
      consumables: JSON,
      outputs: JSON,
      details: JSON
    }

    extend type Query {
      recipe(id: ID!): Recipe
      recipes: [Recipe]
    }
  `;

  model.resolvers = {
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
