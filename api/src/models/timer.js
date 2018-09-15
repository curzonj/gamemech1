import gqlAuth from '../utils/gqlAuth';

module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'timer',
    {
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
      nextId: {
        type: DataTypes.INTEGER,
      },
      queueId: {
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
        details: JSON
      }
    `;

  model.resolvers = {
    Query: {
      now: () => new Date(),
      timer: ({ id }) => model.findById(id),
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
