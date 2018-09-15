module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'timerQueue',
    {
      gameAccountId: {
        type: DataTypes.INTEGER,
        unique: 'game_account_id_facility_id_idx',
      },
      facilityId: {
        type: DataTypes.INTEGER,
        unique: 'game_account_id_facility_id_idx',
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

  model.upsertMatchingId = async (
    gameAccountId,
    blockedContainerId,
    facilityDetails
  ) => {
    const facilityId = await model.db.facility.findMatchingId(
      gameAccountId,
      facilityDetails
    );

    const [instance] = await model.upsert(
      { gameAccountId, facilityId, blockedContainerId },
      { returning: true }
    );

    return instance.id;
  };

  model.findOrCreateAny = async () => {
    let first = await model.findOne({});
    if (!first) {
      first = await model.create({});
    }

    return first;
  };

  return model;
};
