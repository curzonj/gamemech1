module.exports = function(sequelize, DataTypes) {
    const model = sequelize.define("solar_systems", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            unique: true,
        },
    }, {
        timestamps: false,
    })

    return model
}