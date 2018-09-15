module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'type',
    {
      name: {
        type: DataTypes.STRING,
      },
      typeGroupId: {
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
      type Type {
        id: ID!
        name: String
        details: JSON
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

  model.findByName = async function findByName(name, group) {
    const typeGroupId = await model.db.typeGroup.findIdByName(group);

    const record = await model.findOne({
      where: { typeGroupId, name },
    });

    if (record === null) {
      throw new Error(`Unknown ${group} type ${name}`);
    }

    return record;
  };

  return model;
};
