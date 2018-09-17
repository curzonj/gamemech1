import addAsset from '../../utils/addAsset';
import { createTimer } from '../utils';
import safe from '../../shared/try_catch';

import * as db from '../../models';

const {
  Sequelize: { Op },
} = db;

const structureGroupIdPromise = db.typeGroup.findOne({
  where: { name: 'structure' },
});

module.exports = {
  async complete(
    {
      gameAccountId,
      assetInstanceId,
      triggerAt,
      details: { processName, runs },
    },
    t
  ) {
    const facility = await db.assetInstance.findById(assetInstanceId);
    const recipe = await db.recipe.findOne({
      where: {
        identityKey: processName,
      },
    });

    const recipeOutputs = recipe.details.outputs;
    const recipeOutputNames = Object.keys(recipeOutputs);

    await recipeOutputNames.reduce(async (prev, typeId) => {
      await prev;

      const { id: structureGroupId } = await structureGroupIdPromise;
      const type = await db.type.findById(typeId);
      const quantity = recipeOutputs[typeId] * runs;

      if (type.typeGroupId === structureGroupId) {
        const asset = await db.assetInstance.create(
          {
            gameAccountId,
            locationId: facility.locationId,
            typeId,
          },
          { transaction: t }
        );

        if (safe(() => type.details.timerHandler)) {
          await createTimer(
            {
              gameAccountId,
              assetInstanceId: asset.id,
              handler: type.details.timerHandler,
              details: {},
            },
            t,
            triggerAt
          );
        }
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
    }, Promise.resolve());
  },

  async prepare(
    {
      gameAccountId,
      assetInstanceId,
      details: { processName, runs },
    },
    t
  ) {
    const facility = await db.assetInstance.findById(assetInstanceId);
    const recipe = await db.recipe.findOne({
      where: {
        identityKey: processName,
      },
    });
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
