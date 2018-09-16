import addAsset from '../../utils/addAsset';
import * as db from '../../models';

module.exports = {
  async complete({ gameAccountId, facilityId }, t) {
    const facility = await db.facility.findById(facilityId);
    const facilityType = await db.type.findById(facility.typeId);
    const { outputs } = facilityType.details;
    const outputNames = Object.keys(outputs);

    await outputNames.reduce(async (prev, name) => {
      await prev;

      const type = await db.type.findByName(name, 'asset');
      const quantity = outputs[name];

      // TODO fix the location so it's tied to something
      await addAsset(gameAccountId, 0, type.id, quantity, t);
    }, Promise.resolve());
  },

  async prepare({ gameAccountId }, t) {
    return {
      duration: 120,
    };
  },

  reschedule(details, t) {
    return 120;
  },
};
