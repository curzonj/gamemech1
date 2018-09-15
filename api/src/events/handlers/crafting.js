import game from '../../game';
import addAsset from '../../utils/addAsset';
import { createTimer } from '../utils';
import safe from '../../shared/try_catch';

import * as db from '../../models';

const {
  Sequelize: { Op },
} = db;

module.exports = {
  async complete({ gameAccountId, processName, runs }, t, now) {
    const recipe = game.crafting[processName];
    const recipeOutputs = Object.keys(recipe.outputs);

    await recipeOutputs.reduce(async (prev, name) => {
      await prev;

      const type = await db.type.findByName(name, 'asset');
      const quantity = recipe.outputs[name] * runs;

      await addAsset(gameAccountId, 0, type.id, quantity, t);

      if (safe(() => type.details.facilityName)) {
        const facilityType = await db.type.findByName(
          type.details.facilityName,
          'facility'
        );
        const facility = await db.facility.create(
          {
            gameAccountId,
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
              facilityId: facility.id,
              handler: facilityType.details.timerHandler,
              details: {},
            },
            t,
            now
          );
        }
      }
    }, Promise.resolve());
  },

  async prepare({ gameAccountId, processName, runs }, t) {
    const recipe = game.crafting[processName];
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
