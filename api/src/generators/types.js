import { loadYAML } from './utils';
import { each } from '../shared/async';
import db from '../models';

// YAML instead of json because I can add comments
const data = loadYAML('./typesData.yml');

function buildHelper(t) {
  const transaction = t;

  const self = {
    t,

    typeGroups: {},
    async typeGroup(name, idx) {
      await db.typeGroup.upsert(
        { id: idx + 1, name },
        { transaction, returning: true }
      );
      self.typeGroups[name] = idx + 1;
    },

    types: {},
    async type(name, typeGroup, id) {
      await db.type.upsert(
        {
          id,
          name,
          typeGroupId: get('typeGroups', typeGroup),
        },
        { transaction }
      );
      self.types[name] = id;
    },

    async receipe(
      idx,
      dependenciesT,
      inputsT,
      outputsT,
      [duration, facilityType, manual = false]
    ) {
      const inputs = namesToTypeIds(inputsT);
      const consumableIds = Object.keys(inputs);
      const dependencyIds = dependenciesT.map(k => get('types', k));
      dependencyIds.forEach(id => {
        inputs[id] = 0;
      });
      const outputs = namesToTypeIds(outputsT);
      const resultIds = Object.keys(outputs);

      const details = { inputs, outputs };

      await db.recipe.upsert(
        {
          id: idx,
          dependencyIds,
          consumableIds,
          resultIds,
          details,
          duration,
          manual,
          resultStyle: 'fixed',
          resultHandler: 'crafting',
          facilityTypeId: get('types', facilityType),
        },
        { transaction }
      );
    },

    async site(
      idx,
      dependenciesT,
      inputsT,
      outputsT,
      [duration, facilityType, manual = false]
    ) {
      const inputs = namesToTypeIds(inputsT);
      const consumableIds = Object.keys(inputs);
      const dependencyIds = dependenciesT.map(k => get('types', k));
      dependencyIds.forEach(id => {
        inputs[id] = 0;
      });
      const resultIds = outputsT.map(k => get('types', k));

      const details = { inputs };

      await db.recipe.upsert(
        {
          id: 10000 + idx,
          dependencyIds,
          consumableIds,
          resultIds,
          details,
          duration,
          manual,
          resultStyle: outputsT.length > 1 ? 'variable' : 'fixed',
          resultHandler: 'sites',
          facilityTypeId: get('types', facilityType),
        },
        { transaction }
      );
    },
  };

  function get(table, key) {
    const v = self[table][key];
    if (v === undefined) {
      throw new Error(`Not found in ${table}: ${key}`);
    }

    return v;
  }

  function namesToTypeIds(map) {
    return Object.keys(map).reduce((p, n) => {
      p[get('types', n)] = data[n];
      return p;
    }, {});
  }

  return self;
}

export default async function(t) {
  const h = buildHelper(t);

  await each(data.typeGroups, h.typeGroup);

  await each(data.staticTypes, async ([group, list], groupIdx) => {
    await each(list, (type, idx) =>
      h.type(type, group, groupIdx * 100 + idx + 1)
    );
  });

  await each(data.recipes, (args, idx) => h.receipe(idx + 1, ...args));

  await each(data.sites, (args, idx) => h.site(idx + 1, ...args));
}
