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
    async type(name, details, typeGroup, id) {
      await db.type.upsert(
        {
          id,
          name,
          details,
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
      [duration, facilityType, siteTypeName = null, manual = false],
      details = {}
    ) {
      const dependencyIds = dependenciesT.map(k => get('types', k));
      const inputs = namesToTypeIds(inputsT);
      const consumableIds = Object.keys(inputs);
      const outputs = namesToTypeIds(outputsT);
      const resultIds = Object.keys(outputs);
      const siteTypeId = siteTypeName ? get('types', siteTypeName) : null;

      details.inputs = inputs;
      details.outputs = outputs;

      await db.recipe.upsert(
        {
          id: idx,
          dependencyIds,
          consumableIds,
          resultIds,
          details,
          duration,
          manual,
          siteTypeId,
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
      [duration, facilityType, manual = false],
      details = {}
    ) {
      const dependencyIds = dependenciesT.map(k => get('types', k));
      const inputs = namesToTypeIds(inputsT);
      const consumableIds = Object.keys(inputs);
      const resultIds = outputsT.map(k => get('types', k));

      details.inputs = inputs;

      await db.recipe.upsert(
        {
          id: 10000 + idx,
          dependencyIds,
          consumableIds,
          resultIds,
          details,
          duration,
          manual,
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
      p[get('types', n)] = map[n];
      return p;
    }, {});
  }

  return self;
}

export default async function(t) {
  const h = buildHelper(t);

  await each(data.typeGroups, h.typeGroup);

  await each(data.staticTypes, async ([group, value], groupIdx) => {
    const list = Array.isArray(value)
      ? value.map(v => [v, {}])
      : Object.keys(value).map(k => [k, value[k]]);

    await each(list, ([type, details], idx) =>
      h.type(type, details, group, groupIdx * 100 + idx + 1)
    );
  });

  await each(data.recipes, (args, idx) => h.receipe(idx + 1, ...args));

  await each(data.sites, (args, idx) => h.site(idx + 1, ...args));
}
