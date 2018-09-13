import { gqlAuthd } from '../utils';

const db = require('../models');
const { schedule } = require('../event/utils');

const buildThing = gqlAuthd(async req => {
  const queue = await db.timer_queues.findOrCreateAny();

  return schedule({
    game_account_id: req.user.id,
    handler: 'doneBuilding',
    queue_id: queue.id,
    details: {},
  });
});

exports.typeDefs = `
    extend type Mutation {
        buildThing: Timer
    }
`;

exports.resolvers = {
  Mutation: {
    buildThing,
  },
};
