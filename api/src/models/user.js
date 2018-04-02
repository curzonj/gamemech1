module.exports = function(sequelize, DataTypes) {
    const model = sequelize.define("user", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        google_id: {
            type: DataTypes.STRING,
            unique: true,
        }
    }, {
        timestamps: false,
    })

    return model
}