import game from '../../game';

const db = require('../../models');

const {
  Sequelize: { Op },
} = db;

module.exports = {
  async complete({ gameAccountId }, t, now) {
    await recipeInputs.reduce(async (prev, name) => {
      await prev

      await db.asset.upsertOnConflict(
        {
          gameAccountId,
          typeId: toolsId,
          quantity: 1,
        },
        {
          transaction: t,
        }
      );
    }, Promise.resolve())
  },

  async prepare({ gameAccountId, processName, inputs, runs }, t) {
    const recipe = game.crafting[processName];
    const recipeInputs = Object.keys(recipe.inputs);

    const [ok, out] = await recipeInputs.reduce(async (prev, name) => {
      const [prevOk, result] = await prev;
      if (!prevOk) {
        return [prevOk, result];
      }

      const typeId = await db.type.findIdByName(name);
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
              container: null,
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
