import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

export function loadYAML(filepath) {
  return yaml.safeLoad(fs.readFileSync(path.join(__dirname, filepath), 'utf8'));
}

export function seq(n) {
  const list = [];
  for (let i = 0; i < n; i += 1) {
    list.push(i);
  }
  return list;
}
