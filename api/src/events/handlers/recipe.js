import addAsset from '../../utils/addAsset';
import { each } from '../../shared/async';

import * as db from '../../models';

const {
  Sequelize: { Op },
} = db;

const structureGroupIdPromise = db.typeGroup.findOne({
  where: { name: 'structure' },
});

async function discoverSite(gameAccountId, triggerAt, recipe, facility, t) {
  await db.site.create(
    {
      typeId: recipe.resultIds[0],
      locationId: facility.locationId,
    },
    { transaction: t }
  );
}

async function deliverOutputs(
  gameAccountId,
  triggerAt,
  recipe,
  facility,
  runs,
  t
) {
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
}

module.exports = {
  async complete(
    {
      gameAccountId,
      assetInstanceId,
      triggerAt,
      details: { recipeId, runs },
    },
    t
  ) {
    const facility = await db.assetInstance.findById(assetInstanceId);
    const recipe = await db.recipe.findById(recipeId);

    switch (recipe.resultHandler) {
      case 'crafting':
        return deliverOutputs(
          gameAccountId,
          triggerAt,
          recipe,
          facility,
          runs,
          t
        );
      case 'sites':
        return discoverSite(gameAccountId, triggerAt, recipe, facility, t);
      default:
        throw new Error('Unknown recipe resultHandler');
    }
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
          locationId: facility.locationId,
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

    if (!ok) {
      return out;
    }

    await Promise.all(out.map(instance => instance.save({ transaction: t })));

    return {
      duration: recipe.duration * runs,
    };
  },
};
