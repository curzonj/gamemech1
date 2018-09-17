module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'recipe',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      identityKey: {
        type: DataTypes.STRING,
        unique: true,
      },
      facilityTypeId: {
        type: DataTypes.BIGINT,
      },
      inputs: {
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
