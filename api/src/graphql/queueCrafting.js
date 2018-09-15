import gqlAuth from '../utils/gqlAuth';
import { schedule } from '../events/utils';
import game from '../game';

import * as db from '../models';

const queueCrafting = gqlAuth(async (req, args) => {
  const { processName, runs } = args.input;
  const recipe = game.crafting[processName];

  const facilityId = await db.facility.findMatchingId(
    req.user.id,
    recipe.facility
  );

  if (game.crafting[processName] === undefined) {
    throw new Error(`Invalid processName`);
  }

  return schedule({
    gameAccountId: req.user.id,
    handler: 'crafting',
    facilityId,
    details: { processName, runs },
  });
});

exports.typeDefs = `
  input QueueCraftingInput {
    processName: String!,
    runs: Int!
    inputs: [AssetQuantityInput]
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
