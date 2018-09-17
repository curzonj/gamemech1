import { unblock } from '../events/utils';
import reportErr from './reportError';
import * as db from '../models';

// If t is undefined sequelize will proceed without a transaction. It is optional
export default async function addAsset(
  gameAccountId,
  locationId,
  typeId,
  quantity,
  now = new Date(),
  t
) {
  if (typeof quantity !== 'number' || Number.isNaN(quantity)) {
    throw new TypeError(`Expected a number, got: ${quantity}`);
  }

  const { typeGroupId } = await db.type.findById(typeId);
  console.log(typeGroupId);

  const asset = await db.asset.upsertOnConflict(
    {
      gameAccountId,
      locationId,
      typeId,
      typeGroupId,
      quantity,
    },
    {
      transaction: t,
    }
  );

  // copy the value so if something changes the value it won't affect this code
  const finalQuantity = asset.quantity;
  const callback = () => {
    unblock(typeId, locationId, finalQuantity, now).catch(reportErr);
  };

  // It has to run after the transaction happens. The unblocking is slightly
  // optional and we don't want it to interfer with anything the caller is
  // doing with assets right now
  if (t) {
    t.afterCommit(callback);
  } else {
    setImmediate(callback);
  }

  return asset;
}
