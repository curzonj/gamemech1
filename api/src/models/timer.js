import gqlAuth from '../utils/gqlAuth';

module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'timer',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      gameAccountId: {
        type: DataTypes.INTEGER,
      },
      handler: {
        type: DataTypes.STRING,
      },
      triggerAt: {
        type: DataTypes.DATE,
      },
      details: {
        type: DataTypes.JSONB,
      },
      listHead: {
        type: DataTypes.BOOLEAN,
      },
      repeat: {
        type: DataTypes.BOOLEAN,
      },
      nextId: {
        type: DataTypes.INTEGER,
      },
      assetInstanceId: {
        type: DataTypes.INTEGER,
      },
      retries: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: false,
    }
  );

  model.typeDefs = `
      extend type Query {
        timer(id: ID!): Timer
        timers: [Timer]
        now: DateTime
      }

      type Timer {
        id: ID!
        handler: String!
        triggerAt: DateTime
        retries: Int
        nextId: ID
        listHead: Boolean
        details: JSON
      }
    `;

  model.resolvers = {
    Query: {
      now: () => new Date(),
      timer: gqlAuth((req, { id }) =>
        model.findOne({ where: { id, gameAccountId: req.user.id } })
      ),
      timers: gqlAuth(req =>
        model.findAll({
          where: { gameAccountId: req.user.id },
        })
      ),
    },
  };

  const failedJobRetryInterval = 10;
  model.retryById = function retry(jobId) {
    return model.update(
      {
        triggerAt: sequelize.literal(
          `current_timestamp + ((interval '${failedJobRetryInterval}s') * (retries + 1))`
        ),
        retries: sequelize.literal('retries + 1'),
      },
      {
        where: {
          id: jobId,
        },
      }
    );
  };

  return model;
};
