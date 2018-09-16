module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'lootTable',
    {
      name: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      threshold: {
        type: DataTypes.DOUBLE,
        primaryKey: true,
      },
      details: {
        type: DataTypes.JSONB,
      },
    },
    {
      tableName: 'loot_tables',
      timestamps: false,
    }
  );

  model.removeAttribute('id');

  model.typeDefs = `
    type LootTables {
      name: String
      threshold: Float
      details: JSON
    }

    extend type Query {
      lootTables(name: String): [LootTables]
    }
  `;

  model.resolvers = {
    Query: {
      lootTables: (root, args) => {
        if (args.name) {
          return model.findAll({ where: { name: args.name } });
        }

        return model.findAll();
      },
    },
  };

  model.selectFromTable = function findHighestOne(name, transaction) {
    const {
      Sequelize: { Op },
    } = model.db;

    const random = Math.random();
    console.log(random);

    return model.findOne(
      {
        where: {
          name,
          threshold: {
            [Op.gte]: random,
          },
        },
        order: [['threshold', 'ASC']],
        limit: 1,
      },
      {
        transaction,
      }
    );
  };

  return model;
};
