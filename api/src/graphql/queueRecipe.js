import gqlAuth from '../utils/gqlAuth';
import { schedule } from '../events/utils';

import * as db from '../models';

exports.typeDefs = `
  input QueueRecipeInput {
    recipeId: ID!
    locationId: ID!
    runs: Int!
    repeat: Boolean
    inputs: [AssetQuantityInput]
  }

  extend type Mutation {
    queueRecipe(input: QueueRecipeInput!): Timer
  }
`;

exports.resolvers = {
  Mutation: {
    queueRecipe: gqlAuth(async (req, args) => {
      const { recipeId, runs, locationId, repeat } = args.input;
      const recipe = await db.recipe.findById(recipeId);

      if (recipe === null) {
        throw new Error(`Invalid recipeId`);
      }

      // TODO eventually you should be able to specify the assetInstance that you want the recipe attached to
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
        handler: 'recipe',
        assetInstanceId: facility.id,
        repeat,
        details: { recipeId, runs },
      });
    }),
  },
};
