import { gqlAuthd } from '../utils';

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
        details: TimerDetails
      }

      type TimerDetails {
        name: String
      }
    `;

  model.resolvers = {
    Query: {
      now: () => new Date(),
      timer: ({ id }) => model.findById(id),
      timers: gqlAuthd(req =>
        model.findAll({
          where: { gameAccountId: req.user.id },
        })
      ),
    },
  };

  return model;
};
