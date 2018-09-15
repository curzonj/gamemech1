import gqlAuth from '../utils/gqlAuth';
import { schedule } from '../events/utils';
import game from '../game';

import * as db from '../models';

const queueCrafting = gqlAuth(async (req, args) => {
  const { processName } = args.input;
  const recipe = game.crafting[processName];

  const queueId = await db.timerQueue.upsertMatchingId(
    req.user.id,
    0,
    recipe.facility
  );

  if (game.crafting[processName] === undefined) {
    throw new Error(`Invalid processName`);
  }

  return schedule({
    gameAccountId: req.user.id,
    handler: 'crafting',
    queueId,
    details: args.input,
  });
});

exports.typeDefs = `
  input QueueCraftingInput {
    processName: String!,
    runs: Int!
    inputs: [AssetQuantityInput!]!
  }

  extend type Mutation {
    queueCrafting(input: QueueCraftingInput!): Timer
  }
`;

exports.resolvers = {
  Mutation: {
    queueCrafting,
  },
};
