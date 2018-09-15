import gqlAuth from '../utils/gqlAuth';
import { schedule } from '../events/utils';

import * as db from '../models';

const buildThing = gqlAuth(async req => {
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
