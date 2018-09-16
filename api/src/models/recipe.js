module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'recipe',
    {
      identityKey: {
        type: DataTypes.STRING,
      },
      facilityTypeId: {
        type: DataTypes.INTEGER,
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
