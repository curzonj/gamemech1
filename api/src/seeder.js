import _ from 'lodash';
import game from './game';
import * as db from './models';

const { sequelize } = db;

sequelize
  .transaction(async transaction => {
    await game.seeds.reduce(async (prevType, { model: typeName, rows }) => {
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

        const existing = await model.findOne({
          where: row,
          transaction,
        });

        if (!existing) {
          await model.create(row, { transaction });
        }
      }, Promise.resolve());
    }, Promise.resolve());
  })
  .catch(err => console.log(err, err.stack))
  .finally(() => sequelize.connectionManager.close());
