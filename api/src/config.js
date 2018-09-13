const nconf = require('nconf');

nconf.env().file({
  file: '.env.json',
});

function requireValue(setting) {
  if (!nconf.get(setting)) {
    throw new Error(`You must set ${setting} as an environment variable!`);
  }
}

requireValue('DISCORD_OAUTH_CLIENT_ID');
requireValue('DISCORD_OAUTH_CLIENT_SECRET');

module.exports = nconf;
