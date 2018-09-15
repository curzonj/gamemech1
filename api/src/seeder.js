import game from './game';
import * as db from './models';

const { Sequelize, sequelize } = db;

Promise.all(
  Object.keys(game.seeds).map(async typeName => {
    await Promise.all(
      game.seeds[typeName].map(async row => {
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
