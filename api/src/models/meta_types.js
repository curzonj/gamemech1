module.exports = function(sequelize, DataTypes) {
    const model = sequelize.define("meta_types", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            unique: true,
        },
        details: {
            type: DataTypes.JSONB
        },
    }, {
        timestamps: false,
    })

    return model
}