import { Strategy as DiscordStrategy } from 'passport-discord';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import config from '../config';
import * as db from '../models';

const discordScopes = ['identify', 'email'];

function translateDiscordProfileToAccount(
  accessToken,
  refreshToken,
  profile,
  done
) {
  profile.refreshToken = refreshToken;
  profile.scopes = discordScopes;

  db.userProfile
    .findOrCreate({
      where: {
        discordId: profile.id,
      },
      defaults: {
        discordDetails: profile,
      },
    })
    .then(async ([user, created]) => {
      if (!created) {
        await user.update({
          discordDetails: profile,
        });
      }

      const account = await user.getGameAccount();

      done(null, account);
    })
    .catch(err => done(err));
}

export default function(passport) {
  passport.serializeUser((account, done) => {
    done(null, account.id);
  });
  passport.deserializeUser((obj, done) => {
    db.gameAccount
      .findById(obj)
      .then(account => {
        done(null, account);
      })
      .catch(err => done(err));
  });

  passport.use(
    new DiscordStrategy(
      {
        clientID: config.get('DISCORD_OAUTH_CLIENT_ID'),
        clientSecret: config.get('DISCORD_OAUTH_CLIENT_SECRET'),
        callbackURL: 'http://localhost:3001/auth/discord/callback',
        scope: discordScopes,
      },
      translateDiscordProfileToAccount
    )
  );

  const browserDiscordStrategy = new DiscordStrategy(
    {
      clientID: config.get('DISCORD_OAUTH_CLIENT_ID'),
      clientSecret: config.get('DISCORD_OAUTH_CLIENT_SECRET'),
      callbackURL: 'http://localhost:3000/auth/discord/callback',
      scope: discordScopes,
    },
    translateDiscordProfileToAccount
  );
  browserDiscordStrategy.name = 'browserDiscord';
  passport.use(browserDiscordStrategy);

  const jwtOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.get('JWT_SECRET'),
  };
  passport.use(
    new JwtStrategy(jwtOpts, (jwtPayload, done) => {
      db.gameAccount
        .findById(jwtPayload.account_id)
        .then(account => {
          done(null, account);
        })
        .catch(err => done(err));
    })
  );
}
