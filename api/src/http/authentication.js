import passport from 'passport';
import session from 'express-session';
import jwt from 'jsonwebtoken';
import connectStoreFn from 'connect-session-sequelize';
import passportConfig from './passport';
import config from '../config';
import reportError from '../utils/reportError';
import * as db from '../models';

const SessionStoreClass = connectStoreFn(session.Store);
const sessionStore = new SessionStoreClass({ db: db.sequelize });
sessionStore.sync();

passportConfig(passport);

export default function(app) {
  app.use(
    session({
      store: sessionStore,
      secret: config.get('SESSION_SECRET'),
      cookie: {},
      resave: false,
      secure: config.get('NODE_ENV') === 'production',
      saveUninitialized: false,
      proxy: true,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions

  app.use((req, res, next) => {
    if (req.user) {
      // we are already logged in via the session, skip jwt processing
      return next();
    }

    passport.authenticate('jwt', (err, user, info) => {
      if (err || !user) {
        reportError(err);
        return next();
      }

      req.logIn(
        user,
        {
          session: false,
        },
        // eslint-disable-next-line no-shadow
        err => {
          if (err) {
            reportError(err);
          }

          return next();
        }
      );
    })(req, res, next);
  });

  app.get('/login', passport.authenticate('discord'));
  app.get(
    '/auth/discord/callback',
    passport.authenticate('discord', {
      failureRedirect: '/',
    }),
    (req, res) => {
      res.redirect('/graphql'); // Successful auth
    }
  );

  app.post(
    '/login',
    passport.authenticate('browserDiscord', { session: false }),
    (req, res) => {
      const token = jwt.sign(
        {
          account_id: req.user.id,
        },
        config.get('JWT_SECRET')
      );
      res.send(token);
    }
  );

  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/graphql');
  });
}
