module.exports = function(sequelize, DataTypes) {
    const model = sequelize.define("asset_types", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        meta_type_id: {
            type: DataTypes.UUID
        },
        design_id: {
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