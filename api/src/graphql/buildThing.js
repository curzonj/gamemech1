import { gqlAuthd } from '../utils';
import { schedule } from '../events/utils';

const db = require('../models');

const buildThing = gqlAuthd(async req => {
  const queue = await db.timerQueue.findOrCreateAny();

  return schedule({
    gameAccountId: req.user.id,
    handler: 'doneBuilding',
    queueId: queue.id,
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
