import _ from 'lodash';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import * as db from '../models';

const seeds = yaml.safeLoad(
  fs.readFileSync(path.join(__dirname, './seeds.yml'), 'utf8')
);

export default async function(transaction) {
  await seeds.reduce(async (prevType, { model: typeName, rows }) => {
    await prevType;

    const model = db[typeName];

    if (!model) {
      throw new Error(`Missing model: ${typeName}`);
    }

    await rows.reduce(async (prevRow, row) => {
      await prevRow;

      await Object.keys(row).reduce(async (prevKey, k) => {
        await prevKey;

        if (k.endsWith('_name')) {
          const name = row[k];
          const fkType = _.camelCase(k.slice(0, -5));
          delete row[k];

          const fkModel = db[fkType];

          if (!fkModel) {
            throw new Error(`Missing model: ${fkType}`);
          }

          const fk = await fkModel.findOne({
            where: { name },
            transaction,
          });

          if (!fk) {
            throw new Error(`No record found for ${fkType} ${name}`);
          }

          row[`${fkType}Id`] = fk.id;
        }
      }, Promise.resolve());

      const { details } = row;
      delete row.details;

      const existing = await model.findOne({
        where: {
          name: row.name,
        },
        transaction,
      });

      if (!existing) {
        await model.create(row, { transaction });
      } else if (details) {
        await existing.update({ details }, { transaction });
      }
    }, Promise.resolve());
  }, Promise.resolve());
}
