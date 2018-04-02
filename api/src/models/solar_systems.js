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
        details: {
            type: DataTypes.JSONB
        },
    }, {
        timestamps: false,
    })

    model.associate = function(db) {
        model.hasMany(db.sites, {
            foreignKey: "solar_system_id",
        })
    }

    model.prototype.sites = function(a, r, g) {
        return this.getSites()
    }

    return model
}