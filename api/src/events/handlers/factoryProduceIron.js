import addAsset from '../../utils/addAsset';
import * as db from '../../models';

module.exports = {
  async complete({ gameAccountId }, t) {
    const { id: ironId } = await db.type.findByName('iron', 'asset');
    await addAsset(gameAccountId, 0, ironId, 1, t);
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
