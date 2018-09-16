import db from '../models';

export default async function(t) {
  const staticRecipes = [
    {
      identityKey: 'tools',
      details: {
        inputs: { iron: 10 },
        outputs: { tools: 1 },
        duration: 2,
      },
      facilityTypeId: (await db.type.findByName('account', 'facility', t)).id,
    },
    {
      identityKey: 'factory',
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
