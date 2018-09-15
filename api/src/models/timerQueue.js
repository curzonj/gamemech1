module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'timerQueue',
    {
      gameAccountId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      facilityId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      blockedTypeId: {
        type: DataTypes.INTEGER,
      },
      blockedContainerId: {
        type: DataTypes.INTEGER,
      },
      blockedQuantity: {
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: 'timer_queues',
      timestamps: false,
    }
  );

  model.removeAttribute('id');

  model.findLocked = function findLocked(
    gameAccountId,
    facilityId,
    transaction
  ) {
    return model.findOne(
      {
        gameAccountId,
        facilityId,
      },
      {
        transaction,
        lock: transaction.LOCK.UPDATE,
      }
    );
  };

  model.findOrCreateLocked = async function findOrCreateLocked(
    gameAccountId,
    facilityId,
    blockedContainerId,
    t
  ) {
    let queue = await model.findLocked(gameAccountId, facilityId, t);

    if (!queue) {
      // The upsert is intentionally not in the transaction. It gives us something
      // to lock on that other queries can block on locking also
      await model.upsert({
        gameAccountId,
        facilityId,
        blockedContainerId: 0,
      });

      queue = await model.findLocked(gameAccountId, facilityId, t);

      if (!queue) {
        throw new Error(`transaction isolation caused problem timerQueue`);
      }
    }

    return queue;
  };

  return model;
};
