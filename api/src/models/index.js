import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import _ from 'lodash';
import config from '../config';

const basename = path.basename(__filename);

const db = {
  models: [],
};

const sequelize = new Sequelize(config.get('DATABASE_URL'), {
  // NOTE issues with the pool cause the "Cannot read property 'query' of undefined" error
  pool: {
    max: parseInt(config.get('DB_POOL_MAX'), 10),
  },
});

// convert camelCase fields to underscored because postgresql is case-ignorant
sequelize.addHook('beforeDefine', attributes => {
  Object.keys(attributes).forEach(key => {
    if (typeof attributes[key] !== 'function') {
      // eslint-disable-next-line no-param-reassign
      attributes[key].field = _.snakeCase(key);
    }
  });
});

fs.readdirSync(__dirname)
  .filter(
    file =>
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
  )
  .forEach(file => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
    db.models.push(model);
  });

Object.keys(db).forEach(modelName => {
  db[modelName].db = db;
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
