import { gqlAuthd } from '../utils';

module.exports = function(sequelize, DataTypes) {
  const model = sequelize.define(
    'timers',
    {
      game_account_id: {
        type: DataTypes.INTEGER,
      },
      handler: {
        type: DataTypes.STRING,
      },
      trigger_at: {
        type: DataTypes.DATE,
      },
      details: {
        type: DataTypes.JSONB,
      },
      list_head: {
        type: DataTypes.BOOLEAN,
      },
      next_id: {
        type: DataTypes.INTEGER,
      },
      queue_id: {
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
            trigger_at: DateTime
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
          where: { game_account_id: req.user.id },
        })
      ),
    },
  };

  return model;
};
