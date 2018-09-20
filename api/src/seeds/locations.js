import db from '../models';

function buildHelper(t) {
  const transaction = t;

  const self = {
    t,

    locations: {},
    async location(name) {
      const [{ id }] = await db.location.findOrCreate({
        where: { name },
        transaction,
      });
      self.locations[name] = id;
    },
  };

  return self;
}

export default async function(t) {
  const h = buildHelper(t);

  await h.location('everywhere');
}
