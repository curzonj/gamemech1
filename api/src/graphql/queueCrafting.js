import gqlAuth from '../utils/gqlAuth';
import { schedule } from '../events/utils';

import * as db from '../models';

const queueCrafting = gqlAuth(async (req, args) => {
  const { processName, runs, locationId } = args.input;
  const recipe = await db.recipe.findOne({
    where: {
      identityKey: processName,
    },
  });

  if (recipe === null) {
    throw new Error(`Invalid processName`);
  }

  const facilityType = await recipe.facilityType();
  const facility = await db.assetInstance.findOne({
    where: {
      gameAccountId: req.user.id,
      locationId,
      typeId: facilityType.id,
    },
  });

  if (!facility) {
    throw new Error(`No available ${facilityType.name} facilities.`);
  }

  return schedule({
    gameAccountId: req.user.id,
    handler: 'crafting',
    assetInstanceId: facility.id,
    details: { processName, runs },
  });
});

exports.typeDefs = `
  input QueueCraftingInput {
    processName: String!
    locationId: ID!
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
