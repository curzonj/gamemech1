import DataLoader from 'dataloader';
import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'location',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
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

  model.EverywhereId = 1;

  model.resolvers = {
    Query: {
      location: (root, args) => model.findById(args.id),
      locations: () => model.findAll(),
    },
  };

  model.dataloader = function dataloader(req) {
    if (!req.loaders) {
      req.loaders = {};
    }

    if (!req.loaders.location) {
      req.loaders.location = new DataLoader(async keys => {
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

    return req.loaders.location;
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
