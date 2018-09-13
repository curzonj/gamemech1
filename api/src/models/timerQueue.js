module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'timerQueue',
    {
      blockedTypeId: {
        type: DataTypes.INTEGER,
      },
      blockedContainer: {
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

  model.findOrCreateAny = async () => {
    let first = await model.findOne({});
    if (!first) {
      first = await model.create({});
    }

    return first;
  };

  return model;
};
