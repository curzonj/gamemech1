import db from '../models';
import { each } from '../shared/async';

export default async function(transaction) {
  const typeGroupId = await db.typeGroup.findIdByName('dragons', transaction);
  const colors = [
    'blue', // 0.390547596148628
    'yellow', // 0.259085610126259
    'red', // 0.163315469092938
    'green', // 0.096413207154465
    'fuchsia', // 0.052164854560681
    'navy', // 0.024993509144646
    'aqua', // 0.009992609648358
    'teal', // 0.002968534013083
    'silver', // 0.000498657487792
    'purple', // 0.00001995262315
  ];

  const types = [];
  const loot = [];

  colors.forEach((c, index) => {
    const lootSet = [];

    for (let i = 1; i <= 30; i += 1) {
      const name = `${c}-dragon-${i}`;
      lootSet.push(name);
      types.push({
        name,
        typeGroupId,
        details: {
          color: c,
          dragonId: i,
        },
      });
    }

    const decimal = (index + 1) / colors.length;
    const threshold = 1 - (1 - decimal) ** 4.7;
    loot.push({
      name: 'dragons',
      threshold,
      details: {
        list: lootSet,
      },
    });
  });

  await db.lootTable.destroy({ where: { name: 'dragons' } }, { transaction });

  await each(loot, async values =>
    db.lootTable.create(values, { transaction })
  );

  await each(types, async values => db.type.upsert(values, { transaction }));
}
