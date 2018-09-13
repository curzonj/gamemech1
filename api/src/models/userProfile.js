module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'userProfile',
    {
      gameAccountId: {
        type: DataTypes.INTEGER,
      },
      discordId: {
        type: DataTypes.STRING,
      },
      discordDetails: {
        type: DataTypes.JSONB,
      },
    },
    {
      tableName: 'user_profiles',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  model.associate = function associate(db) {
    this.db = db;
  };

  model.prototype.getGameAccount = async function getGameAccount() {
    if (this.gameAccountId) {
      return model.db.gameAccount.findById(this.gameAccountId);
    }
    return sequelize.transaction(async t => {
      const account = await model.db.gameAccount.create(
        {
          type: 'player',
          details: {
            nickname: this.discordDetails.username,
          },
        },
        {
          transaction: t,
        }
      );

      await this.update(
        {
          gameAccountId: account.id,
        },
        {
          transaction: t,
        }
      );

      return account;
    });
  };

  return model;
};
