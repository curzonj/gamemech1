import gqlAuth from '../utils/gqlAuth';
import { schedule } from '../events/utils';

import * as db from '../models';

const buildThing = gqlAuth(async req => {
  const queueId = await db.timerQueue.upsertMatchingId(req.user.id, 0, {
    type: 'account',
  });

  return schedule({
    gameAccountId: req.user.id,
    handler: 'doneBuilding',
    queueId,
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
