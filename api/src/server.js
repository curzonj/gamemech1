const express = require('express')
const passport = require('passport')
const morgan = require('morgan')
const session = require('cookie-session')

const config = require('./config')
const oauth2 = require('./oauth2')

const app = express()

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

// TODO figure out what all the standard sets are
app.set('env', process.env.NODE_ENV)

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  name: 'session',
  secret: config.get('SESSION_SECRET'),
  secure: (app.get('env') === 'production')
}))

// OAuth2
app.use(passport.initialize())
app.use(passport.session())
app.use(oauth2.router)

const authenticated = express.Router()
authenticated.use(oauth2.required)
authenticated.use('/', require('./routes'))
app.use(authenticated)

// Basic error handler
app.use((err, req, res, next) => {
  /* jshint unused:false */
  console.error(err);
  // If our routes specified a specific response, then send that. Otherwise,
  // send a generic message so as not to leak anything.
  res.status(500).send(err.response || 'Something broke!');
});

app.listen(process.env.PORT, function() {
  console.log(`at=listen port=${process.env.PORT}`)
})