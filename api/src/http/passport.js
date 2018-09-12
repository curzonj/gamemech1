const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const config = require('../config');
const db = require('../models');

const discord_scopes = ['identify', 'email'];

function translateDiscordProfileToAccount(
  accessToken,
  refreshToken,
  profile,
  done
) {
  profile.refreshToken = refreshToken;
  profile.scopes = discord_scopes;

  db.user_profiles
    .findOrCreate({
      where: {
        discord_id: profile.id,
      },
      defaults: {
        discord_details: profile,
      },
    })
    .then(async ([user, created]) => {
      if (!created) {
        await user.update({
          discord_details: profile,
        });
      }

      const account = await user.getGameAccount();

      done(null, account);
    })
    .catch(err => done(err));
}

module.exports = function(passport) {
  passport.serializeUser((account, done) => {
    done(null, account.id);
  });
  passport.deserializeUser((obj, done) => {
    db.game_accounts
      .findById(obj)
      .then(account => {
        done(null, account);
      })
      .catch(err => done(err));
  });

  const DiscordStrategy = require('passport-discord').Strategy;
  passport.use(
    new DiscordStrategy(
      {
        clientID: config.get('DISCORD_OAUTH_CLIENT_ID'),
        clientSecret: config.get('DISCORD_OAUTH_CLIENT_SECRET'),
        callbackURL: 'http://localhost:3001/auth/discord/callback',
        scope: discord_scopes,
      },
      translateDiscordProfileToAccount
    )
  );

  const browserDiscordStrategy = new DiscordStrategy(
    {
      clientID: config.get('DISCORD_OAUTH_CLIENT_ID'),
      clientSecret: config.get('DISCORD_OAUTH_CLIENT_SECRET'),
      callbackURL: 'http://localhost:3000/auth/discord/callback',
      scope: discord_scopes,
    },
    translateDiscordProfileToAccount
  );
  browserDiscordStrategy.name = 'browserDiscord';
  passport.use(browserDiscordStrategy);

  const jwt_opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.get('JWT_SECRET'),
  };
  passport.use(
    new JwtStrategy(jwt_opts, (jwt_payload, done) => {
      db.game_accounts
        .findById(jwt_payload.account_id)
        .then(account => {
          done(null, account);
        })
        .catch(err => done(err));
    })
  );
};
