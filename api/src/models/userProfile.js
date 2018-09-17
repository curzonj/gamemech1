module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'userProfile',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      gameAccountId: {
        type: DataTypes.INTEGER,
        unique: true,
      },
      discordId: {
        type: DataTypes.STRING,
        unique: true,
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

  model.getFromDiscord = async function getFromDiscord(profile) {
    const [user, created] = await model.findOrCreate({
      where: {
        discordId: profile.id,
      },
      defaults: {
        discordDetails: profile,
      },
    });

    if (!created) {
      await user.update({
        discordDetails: profile,
      });
    }

    return user.getGameAccount();
  };

  model.prototype.getGameAccount = async function getGameAccount() {
    if (this.gameAccountId) {
      return model.db.gameAccount.findById(this.gameAccountId);
    }
    return sequelize.transaction(async transaction => {
      const account = await model.db.gameAccount.create(
        {
          typeId: (await model.db.type.findByName('player', 'account')).id,
          details: {
            nickname: this.discordDetails.username,
          },
        },
        {
          transaction,
        }
      );

      await model.db.facility.create(
        {
          gameAccountId: account.id,
          typeId: (await model.db.type.findByName('account', 'facility')).id,
        },
        {
          transaction,
        }
      );

      await this.update(
        {
          gameAccountId: account.id,
        },
        {
          transaction,
        }
      );

      return account;
    });
  };

  return model;
};
