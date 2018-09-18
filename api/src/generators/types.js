import { loadYAML, asyncEach } from './utils';

// YAML instead of json because I can add comments
const data = loadYAML('./typesData.yml');

export default async function(h) {
  await asyncEach(data.typeGroups, h.typeGroup);

  await asyncEach(data.staticTypes, async ([group, list]) => {
    await asyncEach(list, type => h.type(type, group));
  });

  await asyncEach(data.recipes, args => h.receipe(...args));
}
