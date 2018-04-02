// copied from https://raw.githubusercontent.com/GoogleCloudPlatform/nodejs-getting-started/master/4-auth/lib/oauth2.js
// based on https://cloud.google.com/nodejs/getting-started/authenticate-users

'use strict'

const uuidv4 = require('uuid/v4')
const express = require('express')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy

const config = require('./config')
const db = require('./models')

// Configure the Google strategy for use by Passport.js.
//
// OAuth 2-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Google API on the user's behalf,
// along with the user's profile. The function must invoke `cb` with a user
// object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new GoogleStrategy({
  clientID: config.get('OAUTH2_CLIENT_ID'),
  clientSecret: config.get('OAUTH2_CLIENT_SECRET'),
  callbackURL: config.get('OAUTH2_CALLBACK'),
  accessType: 'offline'
}, (accessToken, refreshToken, profile, cb) => {
  db.user.findOne({
    where: { google_id: profile.id, }
  }).then(user => {
    if (user == null) {
      var new_id = uuidv4()
      return db.user.create({
        id: new_id,
        google_id: profile.id,
      }).then(() => {
        return db.user.findOne({
          where: { id: new_id }
        })
      })
    } else {
      return user
    }
  }).then(user => {
    cb(null, user)
  }).catch(err => {
    cb(err, null)
  })
}))

passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
passport.deserializeUser((obj, cb) => {
  db.user.findById(obj).then(user => {
    cb(null, user)
  }).catch(err => {
    cb(err, null)
  })
})
// [END setup]

const router = express.Router()

// [START middleware]
// Middleware that requires the user to be logged in. If the user is not logged
// in, it will redirect the user to authorize the application and then return
// them to the original URL they requested.
function authRequired (req, res, next) {
  if (!req.user) {
    req.session.oauth2return = req.originalUrl
    return res.redirect('/auth/login')
  }
  next()
}

// Middleware that exposes the user's profile as well as login/logout URLs to
// any templates. These are available as `profile`, `login`, and `logout`.
function addTemplateVariables (req, res, next) {
  res.locals.profile = req.user
  res.locals.login = `/auth/login?return=${encodeURIComponent(req.originalUrl)}`
  res.locals.logout = `/auth/logout?return=${encodeURIComponent(req.originalUrl)}`
  next()
}
// [END middleware]

// Begins the authorization flow. The user will be redirected to Google where
// they can authorize the application to have access to their basic profile
// information. Upon approval the user is redirected to `/auth/google/callback`.
// If the `return` query parameter is specified when sending a user to this URL
// then they will be redirected to that URL when the flow is finished.
// [START authorize]
router.get(
  // Login url
  '/auth/login',

  // Save the url of the user's current page so the app can redirect back to
  // it after authorization
  (req, res, next) => {
    if (req.query.return) {
      req.session.oauth2return = req.query.return
    }
    next()
  },

  // Start OAuth 2 flow using Passport.js
  passport.authenticate('google', { scope: ['email', 'profile'] })
)
// [END authorize]

// [START callback]
router.get(
  // OAuth 2 callback url. Use this url to configure your OAuth client in the
  // Google Developers console
  '/auth/google/callback',

  // Finish OAuth 2 flow using Passport.js
  passport.authenticate('google'),

  // Redirect back to the original page, if any
  (req, res) => {
    const redirect = req.session.oauth2return || '/'
    delete req.session.oauth2return
    res.redirect(redirect)
  }
)
// [END callback]

// Deletes the user's credentials and profile from the session.
// This does not revoke any active tokens.
router.get('/auth/logout', (req, res) => {
  if (req.session.destroy) {
    req.session.destroy()
  }

  req.logout()
  res.redirect('/')
})

module.exports = {
  router: router,
  required: authRequired,
  template: addTemplateVariables
}