import { Op } from 'sequelize';

import addAsset from '../../utils/addAsset';
import { each } from '../../shared/async';
import * as db from '../../models';

const structureGroupIdPromise = db.typeGroup.findOne({
  where: { name: 'structure' },
});

const resultHandlers = {
  async sites(gameAccountId, triggerAt, recipe, facility, jobDetails, t) {
    await db.site.create(
      {
        typeId: recipe.resultIds[0],
        locationId: facility.locationId,
      },
      { transaction: t }
    );
  },

  async crafting(gameAccountId, triggerAt, recipe, facility, { runs }, t) {
    const recipeOutputs = recipe.details.outputs;
    const recipeOutputNames = Object.keys(recipeOutputs);

    await each(recipeOutputNames, async typeId => {
      const { id: structureGroupId } = await structureGroupIdPromise;
      const type = await db.type.findById(typeId);
      const quantity = recipeOutputs[typeId] * runs;

      if (type.typeGroupId === structureGroupId) {
        await db.assetInstance.create(
          {
            gameAccountId,
            locationId: facility.locationId,
            typeId,
          },
          { transaction: t }
        );
      } else {
        await addAsset(
          gameAccountId,
          facility.locationId,
          typeId,
          quantity,
          triggerAt,
          t
        );
      }
    });
  },
};

async function checkSiteRequirements(recipe, gameAccountId, assetInstance) {
  if (!recipe.siteTypeId) {
    return [true, null];
  }

  const site = db.site.findOne({
    where: {
      locationId: assetInstance.locationId,
      [Op.or]: [{ visibleById: null }, { visibleById: gameAccountId }],
    },
  });

  if (!site) {
    return [
      false,
      {
        skip: true,
      },
    ];
  }

  return [true, null];
}

async function checkDependencies(recipe, gameAccountId, locationId) {
  return recipe.dependencyIds.reduce(async (prev, typeId) => {
    const [prevOk, result] = await prev;
    if (!prevOk) {
      return [prevOk, result];
    }

    const a = await db.asset.findOne({
      where: {
        gameAccountId,
        locationId,
        typeId,
      },
    });

    if (a === null) {
      return [
        false,
        {
          reqs: {
            typeId,
            quantity: 1,
          },
        },
      ];
    }

    return [true, null];
  }, Promise.resolve([true, null]));
}

async function consumeInputs(recipe, gameAccountId, locationId, runs, t) {
  const recipeInputs = recipe.details.inputs;
  const recipeInputNames = Object.keys(recipeInputs);

  const [ok, out] = await recipeInputNames.reduce(async (prev, typeId) => {
    const [prevOk, result] = await prev;
    if (!prevOk) {
      return [prevOk, result];
    }

    const quantity = recipeInputs[typeId] * runs;

    const a = await db.asset.findOne({
      where: {
        gameAccountId,
        locationId,
        typeId,
        quantity: {
          [Op.gte]: quantity,
        },
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (a === null) {
      return [
        false,
        {
          reqs: {
            typeId,
            quantity,
          },
        },
      ];
    }
    a.quantity -= quantity;
    result.push(a);

    return [true, result];
  }, Promise.resolve([true, []]));

  const cb = async () => {
    if (ok) {
      await Promise.all(out.map(instance => instance.save({ transaction: t })));
    }
  };

  return [ok, out, cb];
}

module.exports = {
  async complete(
    {
      gameAccountId,
      assetInstanceId,
      triggerAt,
      details: { recipeId, ...details },
    },
    t
  ) {
    const facility = await db.assetInstance.findById(assetInstanceId);
    const recipe = await db.recipe.findById(recipeId);
    const fn = resultHandlers[recipe.resultHandler];

    if (!fn) {
      throw new Error('Unknown recipe resultHandler');
    }

    return fn(gameAccountId, triggerAt, recipe, facility, details, t);
  },

  async prepare(
    {
      gameAccountId,
      assetInstanceId,
      details: { recipeId, runs },
    },
    t
  ) {
    const facility = await db.assetInstance.findById(assetInstanceId);
    const recipe = await db.recipe.findById(recipeId);

    let [ok, result] = await checkDependencies(
      recipe,
      gameAccountId,
      facility.locationId
    );
    if (!ok) {
      return result;
    }

    [ok, result] = await checkSiteRequirements(recipe, gameAccountId, facility);
    if (!ok) {
      return result;
    }

    let saveInputs = null;
    [ok, result, saveInputs] = await consumeInputs(
      recipe,
      gameAccountId,
      facility.locationId,
      runs,
      t
    );
    if (!ok) {
      return result;
    }

    await saveInputs();

    return {
      duration: recipe.duration * runs,
    };
  },
};
