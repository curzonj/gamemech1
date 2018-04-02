module.exports = function(sequelize, DataTypes) {
    const model = sequelize.define("users", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        google_id: {
            type: DataTypes.STRING,
            unique: true,
        },
        google_name: {
            type: DataTypes.STRING,
        },
    }, {
        timestamps: false,
    })

    return model
}