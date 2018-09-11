module.exports = function(sequelize, DataTypes) {
    const model = sequelize.define("game_accounts", {
        details: {
            type: DataTypes.JSONB,
        }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    })

    return model
}