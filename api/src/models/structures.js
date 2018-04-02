module.exports = function(sequelize, DataTypes) {
    const model = sequelize.define("structures", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        asset_type_id: {
            type: DataTypes.UUID
        },
        site_id: {
            type: DataTypes.UUID
        },
        owner_id: {
            type: DataTypes.UUID
        },
        owner_type: {
            type: DataTypes.STRING
        },
        details: {
            type: DataTypes.JSONB
        },
    }, {
        timestamps: false,
    })

    model.associate = function(db) {
        model.belongsTo(db.asset_types, {
            foreignKey: "asset_type_id",
            as: "AssetType"
        })

        model.belongsTo(db.sites, {
            foreignKey: "site_id"
        })
    }

    model.prototype.owner = function(a, r, g) {
        if (this.owner_type == "account") {
            return model.db.users.findById(this.owner_id)
        }
    }

    model.prototype.asset_type = function(a, r, g) {
        return this.getAssetType()
    }

    model.prototype.site = function(a, r, g) {
        return this.getSite()
    }

    return model
}