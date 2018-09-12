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
      const handlers = require(`./${file}`);

      Object.assign(module.exports, handlers);
    } catch (e) {
      console.log('was loading', file);
      throw e;
    }
  });
