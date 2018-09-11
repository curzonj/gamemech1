module.exports = function(sequelize, DataTypes) {
    const model = sequelize.define("user_profiles", {
        discord_id: {
            type: DataTypes.STRING,
        },
        discord_details: {
            type: DataTypes.JSONB,
        }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    })

    return model
}