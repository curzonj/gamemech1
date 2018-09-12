module.exports = function(sequelize, DataTypes) {
  const model = sequelize.define(
    'schemaless',
    {
      type: {
        type: DataTypes.STRING,
      },
      details: {
        type: DataTypes.JSONB,
      },
    },
    {
      tableName: 'schemaless',

      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  model.removeAttribute('id');

  return model;
};
