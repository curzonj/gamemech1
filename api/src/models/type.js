import safe from '../shared/try_catch';

module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'type',
    {
      name: {
        type: DataTypes.STRING,
      },
    },
    {
      timestamps: false,
    }
  );

  model.typeDefs = `
      type Type {
        id: ID!
        name: String
      }

      extend type Query {
        type(id: ID!): Type
        types: [Type]
      }
    `;

  model.resolvers = {
    Query: {
      type: (root, args) => model.findById(args.id),
      types: () => model.findAll(),
    },
  };

  model.findIdByName = async name => {
    const record = await model.findOne({
      where: { name },
    });

    if (record === null) {
      throw new Error(`Unknown type ${name}`);
    }

    return record.id;
  };

  return model;
};
