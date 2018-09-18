import * as db from '../models';
import location from './locations';
import types from './types';
import { getHelper } from './utils';

const { sequelize } = db;

sequelize
  .transaction(async t => {
    const h = getHelper(t);

    await h.truncate();

    await location(h);
    await types(h);
  })
  .catch(err => console.log(err, err.stack))
  .finally(() => sequelize.connectionManager.close());
