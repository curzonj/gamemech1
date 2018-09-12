const db = require('../models');
const { schedule } = require('../event/utils');

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

async function buildThing(root, args, req, info) {
  if (!req.user) {
    return;
  }

  const queue = await db.timer_queues.findOrCreateAny();

  return schedule({
    game_account_id: req.user.id,
    handler: 'doneBuilding',
    queue_id: queue.id,
    details: {},
  });
}
