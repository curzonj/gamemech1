module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'typeGroup',
    {
      name: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: 'type_groups',
      timestamps: false,
    }
  );

  model.typeDefs = `
        type TypeGroup {
          id: ID!
          name: String
        }
  
        extend type Query {
          typeGroup(id: ID!): TypeGroup
          typeGroups: [TypeGroup]
        }
      `;

  model.resolvers = {
    Query: {
      typeGroup: (root, args) => model.findById(args.id),
      typeGroups: () => model.findAll(),
    },
  };

  model.findIdByName = async function findIdByName(name, transaction) {
    const record = await model.findOne({
      where: { name },
      transaction,
    });

    if (record === null) {
      throw new Error(`Unknown typeGroup ${name}`);
    }

    return record.id;
  };

  return model;
};
