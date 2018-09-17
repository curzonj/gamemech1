import addAsset from '../../utils/addAsset';
import { createTimer } from '../utils';
import safe from '../../shared/try_catch';

import * as db from '../../models';

const {
  Sequelize: { Op },
} = db;

module.exports = {
  async complete(
    {
      gameAccountId,
      assetInstanceId,
      processName,
      triggerAt,
      details: { runs },
    },
    t
  ) {
    const facility = await db.assetInstance.findById(assetInstanceId);
    const recipe = await db.recipe.findOne({
      where: {
        identityKey: processName,
      },
    });

    const recipeOutputs = Object.keys(recipe.outputs);

    await recipeOutputs.reduce(async (prev, name) => {
      await prev;

      const type = await db.type.findByName(name, 'asset');
      const quantity = recipe.outputs[name] * runs;

      await addAsset(
        gameAccountId,
        facility.locationId,
        type.id,
        quantity,
        triggerAt,
        t
      );

      if (safe(() => type.details.facilityName)) {
        const facilityType = await db.type.findByName(
          type.details.facilityName,
          'facility'
        );
        const newFacility = await db.assetInstances.create(
          {
            gameAccountId,
            locationId: facility.locationId,
            typeId: facilityType.id,
          },
          { transaction: t }
        );

        // TODO at some point this will need to be centralized to some
        // common code for creating new facilities. perhaps the account
        // facility needs to run a timer and could benefit from the code
        // reuse
        if (safe(() => facilityType.details.timerHandler)) {
          await createTimer(
            {
              gameAccountId,
              assetInstanceId: newFacility.id,
              handler: facilityType.details.timerHandler,
              details: {},
            },
            t,
            triggerAt
          );
        }
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
    const recipeInputs = Object.keys(recipe.inputs);

    const [ok, out] = await recipeInputs.reduce(async (prev, name) => {
      const [prevOk, result] = await prev;
      if (!prevOk) {
        return [prevOk, result];
      }

      const { id: typeId } = await db.type.findByName(name, 'asset');
      const quantity = recipe.inputs[name] * runs;

      const a = await db.asset.findOne(
        {
          where: {
            gameAccountId,
            locationId: facility.locationId,
            typeId,
            quantity: {
              [Op.gte]: quantity,
            },
          },
        },
        {
          transaction: t,
          lock: t.LOCK.UPDATE,
        }
      );

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

    await Promise.all(out.map(instance => instance.save()));

    return {
      duration: recipe.duration * runs,
    };
  },
};
