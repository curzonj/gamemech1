import gqlAuth from '../utils/gqlAuth';
import { scheduleTimer } from '../events/utils';

import * as db from '../models';

const { sequelize } = db;

exports.typeDefs = `
  input QueueRecipeInput {
    recipeId: ID!
    runs: Int
    locationId: ID
    assetInstanceId: ID
    repeat: Boolean
  }

  extend type Mutation {
    queueRecipe(input: QueueRecipeInput!): Timer
  }
`;

exports.resolvers = {
  Mutation: {
    queueRecipe: gqlAuth(async (req, args) => {
      const gameAccountId = req.user.id;
      const { recipeId, runs = 1, locationId, repeat = false } = args.input;
      let { assetInstanceId } = args.input;

      const recipe = await db.recipe.findById(recipeId);

      if (recipe === null) {
        throw new Error(`Invalid recipeId`);
      }

      if (recipe.manual && repeat) {
        throw new Error(`Manual recipes may not repeat`);
      }

      if (recipe.manual && runs > 1) {
        throw new Error(`Manual recipes are limited to 1 run`);
      }

      if (!assetInstanceId) {
        if (!locationId) {
          throw new Error('Either assetInstanceId or locationId is required');
        }

        const facilityType = await recipe.facilityType();
        const facility = await db.assetInstance.findOne({
          where: {
            gameAccountId,
            locationId,
            typeId: facilityType.id,
          },
        });

        if (!facility) {
          throw new Error(`No available ${facilityType.name} facilities.`);
        }
        assetInstanceId = facility.id;
      }

      return sequelize.transaction(async t => {
        const queue = await getLockedQueue(gameAccountId, assetInstanceId, t);

        const job = await db.timer.create(
          {
            handler: 'recipe',
            gameAccountId,
            assetInstanceId,
            repeat,
            details: { recipeId, runs },
          },
          {
            transaction: t,
          }
        );

        await scheduleTimer(queue, job, recipe.manual, t);

        return job;
      });
    }),
  },
};

async function getLockedQueue(gameAccountId, assetInstanceId, transaction) {
  const facility = await db.assetInstance.findById(assetInstanceId, {
    transaction,
  });

  return db.timerQueue.findOrCreateLocked(
    gameAccountId,
    assetInstanceId,
    facility.locationId,
    transaction
  );
}
