import db from '../models';

export default async function(t) {
  const ironId = (await db.type.findByName('iron', 'material', t)).id;
  const toolsId = (await db.type.findByName('tools', 'material', t)).id;
  const mineId = (await db.type.findByName('mine', 'structure', t)).id;
  const accountId = (await db.type.findByName('account', 'facility', t)).id;

  const staticRecipes = [
    {
      identityKey: 'tools',
      dependencies: [],
      consumables: [ironId],
      outputs: [toolsId],
      duration: 2,
      details: {
        inputs: { [ironId]: 10 },
        outputs: { [toolsId]: 1 },
      },
      facilityTypeId: accountId,
    },
    {
      identityKey: 'mine',
      dependencies: [],
      consumables: [toolsId],
      outputs: [mineId],
      duration: 120,
      details: {
        inputs: { [toolsId]: 10 },
        outputs: { [mineId]: 1 },
      },
      facilityTypeId: accountId,
    },
  ];

  await staticRecipes.reduce(async (prev, values) => {
    await prev;

    await db.recipe.upsert(values, { transaction: t });
  }, Promise.resolve());
}
