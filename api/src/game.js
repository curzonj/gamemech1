import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

const game = {};

fs.readdirSync(path.join(__dirname, '../game'))
  .filter(file => file.indexOf('.') !== 0 && file.slice(-4) === '.yml')
  .forEach(file => {
    const name = path.basename(file, '.yml');
    game[name] = yaml.safeLoad(
      fs.readFileSync(path.join(__dirname, `../game/${file}`), 'utf8')
    );
  });

export default game;
