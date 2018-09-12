module.exports = function(sequelize, DataTypes) {
    const model = sequelize.define("user_profiles", {
        game_account_id: {
            type: DataTypes.INTEGER,
        },
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

    model.associate = function(db) {
        this.db = db
    }

    model.prototype.getGameAccount = async function() {
        if (this.game_account_id) {
            return await model.db.game_accounts.findById(this.game_account_id)
        } else {
            return await sequelize.transaction(async (t) => {
                let account = await model.db.game_accounts.create({
                    details: {
                        nickname: this.discord_details.username
                    }
                }, {
                    transaction: t
                })

                await this.update({
                    game_account_id: account.id
                }, {
                    transaction: t
                })

                return account
            })
        }
    }

    return model
}