import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import db from '../models';

export function loadYAML(filepath) {
  return yaml.safeLoad(fs.readFileSync(path.join(__dirname, filepath), 'utf8'));
}

export async function asyncEach(list, fn) {
  await list.reduce(async (prev, row) => {
    await prev;
    await fn(row);
  }, Promise.resolve());
}

export function seq(n) {
  const list = [];
  for (let i = 0; i < n; i += 1) {
    list.push(i);
  }
  return list;
}

export function getHelper(t) {
  const transaction = t;

  function get(table, key) {
    // eslint-disable-next-line no-use-before-define
    const v = self[table][key];
    if (!v) {
      throw new Error(`Not found in ${table}: ${key}`);
    }

    return v;
  }

  const self = {
    t,

    // Selectively truncate tables that don't get upserted and won't have FK issues
    async truncate() {
      await db.recipe.truncate({ transaction });
    },

    locations: {},
    async location(name) {
      const [{ id }] = await db.location.upsert(
        { name },
        { transaction, returning: true }
      );
      self.locations[name] = id;
    },

    typeGroups: {},
    async typeGroup(name) {
      const [{ id }] = await db.typeGroup.upsert(
        { name },
        { transaction, returning: true }
      );
      self.typeGroups[name] = id;
    },

    types: {},
    async type(name, typeGroup) {
      const [{ id }] = await db.type.upsert(
        {
          name,
          typeGroupId: get('typeGroups', typeGroup),
        },
        { transaction, returning: true }
      );
      self.types[name] = id;
    },

    async receipe(dependenciesT, inputsT, outputsT, duration, facilityType) {
      const inputs = Object.keys(inputsT).reduce((p, n) => {
        p[get('types', n)] = inputsT[n];
        return p;
      }, {});
      const consumableIDs = Object.keys(inputs);
      const dependencyIDs = dependenciesT.map(k => get('types', k));
      dependencyIDs.forEach(id => {
        inputs[id] = 0;
      });
      const outputs = Object.keys(outputsT).reduce((p, n) => {
        p[get('types', n)] = outputsT[n];
        return p;
      }, {});
      const outputIDs = Object.keys(outputs);

      const details = { inputs, outputs };

      await db.recipe.create(
        {
          dependencies: dependencyIDs,
          consumables: consumableIDs,
          outputs: outputIDs,
          details,
          duration,
          facilityTypeId: get('types', facilityType),
        },
        { transaction }
      );
    },
  };

  return self;
}
