import gqlAuth from '../utils/gqlAuth';

module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'assetInstance',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      typeId: {
        type: DataTypes.BIGINT,
      },
      gameAccountId: {
        type: DataTypes.BIGINT,
      },
      locationId: {
        type: DataTypes.BIGINT,
      },
      details: {
        type: DataTypes.JSONB,
      },
    },
    {
      tableName: 'asset_instances',
      timestamps: false,
    }
  );

  model.typeDefs = `
      type AssetInstance {
        id: ID!
        type: Type
        timerBlockedType: Type
        timerBlockedQuantity: Int
        timers: [Timer]
        details: JSON
      }

      extend type Query {
        assetInstances: [AssetInstance]
      }
    `;

  model.resolvers = {
    AssetInstance: {
      type: gqlAuth(async (req, args, root) =>
        model.db.type.dataloader(req).load(root.typeId)
      ),
      timers: gqlAuth(async (req, args, root, info) =>
        model.db.timer.findAll({
          where: {
            gameAccountId: req.user.id,
            assetInstanceId: root.id,
          },
        })
      ),
      timerBlockedQuantity: gqlAuth(async (req, args, root, info) => {
        const queue = await model.db.timerQueue.findOne({
          where: {
            gameAccountId: req.user.id,
            assetInstanceId: root.id,
          },
        });

        if (queue) {
          return queue.blockedQuantity;
        }

        return null;
      }),
      timerBlockedType: gqlAuth(async (req, args, root, info) => {
        const queue = await model.db.timerQueue.findOne({
          where: {
            gameAccountId: req.user.id,
            assetInstanceId: root.id,
          },
        });

        if (queue) {
          return model.db.type.findById(queue.blockedTypeId);
        }

        return null;
      }),
    },
    Query: {
      assetInstances: gqlAuth(req =>
        model.findAll({
          where: { gameAccountId: req.user.id },
        })
      ),
    },
  };

  return model;
};
