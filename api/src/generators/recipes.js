import db from '../models';

export default async function(t) {
  const staticRecipes = [
    {
      identityKey: 'tools',
      dependencies: [],
      consumables: [(await db.type.findByName('iron', 'asset', t)).id],
      outputs: [(await db.type.findByName('tools', 'asset', t)).id],
      details: {
        inputs: { iron: 10 },
        outputs: { tools: 1 },
        duration: 2,
      },
      facilityTypeId: (await db.type.findByName('account', 'facility', t)).id,
    },
    {
      identityKey: 'factory',
      dependencies: [],
      consumables: [(await db.type.findByName('tools', 'asset', t)).id],
      outputs: [(await db.type.findByName('iron', 'asset', t)).id],
      details: {
        inputs: { tools: 10 },
        outputs: { factory: 1 },
        duration: 120,
      },
      facilityTypeId: (await db.type.findByName('account', 'facility', t)).id,
    },
  ];

  await staticRecipes.reduce(async (prev, values) => {
    await prev;

    await db.recipe.upsert(values, { transaction: t });
  }, Promise.resolve());
}
