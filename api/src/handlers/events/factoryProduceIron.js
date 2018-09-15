import addAsset from '../../utils/addAsset';
import * as db from '../../models';

module.exports = {
  async complete({ gameAccountId }, t) {
    const ironId = await db.type.findIdByName('iron');
    await addAsset(gameAccountId, ironId, 1, t);
  },

  reschedule(details, t) {
    return 120;
  },
};
