const passport = require('passport');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const jwt = require('jsonwebtoken');
const config = require('../config');

require('./passport')(passport);

module.exports = function(app) {
  app.use(
    session({
      store: new FileStore({
        path: './.sessions',
      }),
      secret: config.get('SESSION_SECRET'),
      cookie: {},
      resave: false,
      saveUninitialized: false,
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
        console.log(err);
        return next();
      }

      req.logIn(
        user,
        {
          session: false,
        },
        err => {
          if (err) {
            console.log(err);
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
      res.redirect('/'); // Successful auth
    }
  );

  app.post('/login', passport.authenticate('browserDiscord'), (req, res) => {
    const token = jwt.sign(
      {
        account_id: req.user.id,
      },
      config.get('JWT_SECRET')
    );
    res.send(token);
  });

  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });
};
