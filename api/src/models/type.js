import DataLoader from 'dataloader';

module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'type',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        unique: 'byTypeGroup',
      },
      typeGroupId: {
        type: DataTypes.INTEGER,
        unique: 'byTypeGroup',
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

  model.dataloader = function dataloader(req) {
    const {
      Sequelize: { Op },
    } = model.db;

    if (!req.loaders) {
      req.loaders = {};
    }

    if (!req.loaders.type) {
      req.loaders.type = new DataLoader(async keys => {
        const list = await model.findAll({
          where: {
            id: {
              [Op.in]: keys,
            },
          },
        });

        return keys.map(k => list.find(obj => obj.id === k));
      });
    }

    return req.loaders.type;
  };

  model.findByName = async function findByName(name, group, transaction) {
    const typeGroupId = await model.db.typeGroup.findIdByName(
      group,
      transaction
    );

    const record = await model.findOne({
      where: { typeGroupId, name },
      transaction,
    });

    if (record === null) {
      throw new Error(`Unknown ${group} type ${name}`);
    }

    return record;
  };

  return model;
};
