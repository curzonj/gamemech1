module.exports = function(sequelize, DataTypes) {
    const model = sequelize.define("sites", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        solar_system_id: {
            type: DataTypes.UUID
        },
        name: {
            type: DataTypes.STRING
        },
        details: {
            type: DataTypes.JSONB
        },
    }, {
        timestamps: false,
    })

    return model
}