import * as db from '../models';
import location from './locations';
import types from './types';

const { sequelize } = db;

sequelize
  .transaction(async t => {
    await location(t);
    await types(t);
  })
  .catch(err => console.log(err, err.stack))
  .finally(() => sequelize.connectionManager.close());
