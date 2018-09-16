import * as db from '../models';
import seeds from './seeds';
import recipes from './recipes';
import loot from './loot';

const { sequelize } = db;

sequelize
  .transaction(async t => {
    await seeds(t);
    await recipes(t);
    await loot(t);
  })
  .catch(err => console.log(err, err.stack))
  .finally(() => sequelize.connectionManager.close());
