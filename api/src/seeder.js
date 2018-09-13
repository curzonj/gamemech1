const db = require('./models');
const gameData = require('../game/v0.json');

const { Sequelize, sequelize } = db;

Promise.all(
  Object.keys(gameData).map(async typeName => {
    await Promise.all(
      gameData[typeName].map(async row => {
        await db[typeName]
          .create(row)
          .catch(Sequelize.ValidationError, err => {
            console.log(
              `${err.name}: ${err.parent.detail} ${JSON.stringify(err.fields)}`
            );
          })
          .catch(err => console.log(err));
      })
    );
  })
)
  .then(() => sequelize.connectionManager.close())
  .catch(err => console.log(err, err.stack));
