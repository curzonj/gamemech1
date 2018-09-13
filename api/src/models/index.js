const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const decamelize = require('decamelize');

const basename = path.basename(__filename);
const config = require('../config');

const db = {
  models: [],
};

const sequelize = new Sequelize(config.get('DATABASE_URL'), {});

// convert camelCase fields to underscored because postgresql is case-ignorant
sequelize.addHook('beforeDefine', attributes => {
  Object.keys(attributes).forEach(key => {
    if (typeof attributes[key] !== 'function') {
      // eslint-disable-next-line no-param-reassign
      attributes[key].field = decamelize(key);
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
