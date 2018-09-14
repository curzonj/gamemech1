import { gqlAuthd } from '../utils';
import { schedule } from '../events/utils';
import game from '../game';

const db = require('../models');

const queueCrafting = gqlAuthd(async (req, args) => {
  const queue = await db.timerQueue.findOrCreateAny();

  if (game.crafting[args.input.processName] === undefined) {
    throw new Error(`Invalid processName`);
  }

  return schedule({
    gameAccountId: req.user.id,
    handler: 'crafting',
    queueId: queue.id,
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
