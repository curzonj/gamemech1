const fs = require('fs');
const path = require('path');

const basename = path.basename(__filename);

fs.readdirSync(__dirname)
  .filter(
    file =>
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
  )
  .forEach(file => {
    try {
      const name = path.basename(file, '.js');

      // eslint-disable-next-line global-require, import/no-dynamic-require
      module.exports[name] = require(`./${file}`);
    } catch (e) {
      console.log('was loading', file);
      throw e;
    }
  });
