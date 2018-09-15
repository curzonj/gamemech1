module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'location',
    {
      id: {
        // We need to be explicit here so that we can insert a location
        // with a specific ID as we want to do with sector0
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
      },
    },
    {
      timestamps: false,
    }
  );

  model.typeDefs = `
        type Location {
          id: ID!
          name: String
        }
  
        extend type Query {
          location(id: ID!): Location
          locations: [Location]
        }
      `;

  model.resolvers = {
    Query: {
      location: (root, args) => model.findById(args.id),
      locations: () => model.findAll(),
    },
  };

  model.findIdByName = async name => {
    const record = await model.findOne({
      where: { name },
    });

    if (record === null) {
      throw new Error(`Unknown location ${name}`);
    }

    return record.id;
  };

  return model;
};
