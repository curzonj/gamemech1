import addAsset from '../../utils/addAsset';
import * as db from '../../models';

module.exports = {
  async complete({ gameAccountId, assetInstanceId, triggerAt }, t) {
    const facility = await db.assetInstance.findById(assetInstanceId);
    const facilityType = await db.type.findById(facility.typeId);
    const { outputs } = facilityType.details;
    const outputNames = Object.keys(outputs);

    await outputNames.reduce(async (prev, name) => {
      await prev;

      const type = await db.type.findByName(name, 'material');
      const quantity = outputs[name];

      await addAsset(
        gameAccountId,
        facility.locationId,
        type.id,
        quantity,
        triggerAt,
        t
      );
    }, Promise.resolve());
  },

  async prepare({ gameAccountId }, t) {
    return {
      duration: 120,
    };
  },

  reschedule(job, t) {
    return 120;
  },
};
