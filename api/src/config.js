const nconf = require('nconf');

nconf
  .env()
  .file({
    file: '.env.json',
  })
  .defaults({
    // When the process is starting up it will easily consume this many connections and
    // then a few more. The DB_POOL_MAX must be able to handle it otherwise you'll get
    // ConnectionAcquireTimeoutError
    TIMER_CONCURRENCY: 20,

    DB_POOL_MAX: 25,
  });

function requireValue(setting) {
  if (!nconf.get(setting)) {
    throw new Error(`You must set ${setting} as an environment variable!`);
  }
}

requireValue('DATABASE_URL');
requireValue('DISCORD_CALLBACK_URL');
requireValue('DISCORD_OAUTH_CLIENT_ID');
requireValue('DISCORD_OAUTH_CLIENT_SECRET');

export default nconf;
