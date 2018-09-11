const config = require('../config')
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const db = require('../models')

const discord_scopes = [ 'identify', 'email' ]

function translateDiscordProfileToUser(accessToken, refreshToken, profile, done) {
    profile.refreshToken = refreshToken
    profile.scopes = discord_scopes

    db.user_profiles.findOrCreate({
        where: { discord_id: profile.id },
        defaults: { discord_details: profile }
    })
    .then(async ([user, created]) => {
        if (!created) {
            await user.update({discord_details: profile})
        }

        done(null, user)
    })
    .catch(err => done(err))
}

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function(obj, done) {
        db.user_profiles.findById(obj)
        .then(user => {
            done(null, user)
        })
        .catch(err => done(err))
    });

    const DiscordStrategy = require('passport-discord').Strategy;
    passport.use(new DiscordStrategy({
        clientID: config.get('DISCORD_OAUTH_CLIENT_ID'),
        clientSecret: config.get('DISCORD_OAUTH_CLIENT_SECRET'),
        callbackURL: 'http://localhost:3001/auth/discord/callback',
        scope: discord_scopes,
    }, translateDiscordProfileToUser))

    const browserDiscordStrategy = new DiscordStrategy({
        clientID: config.get('DISCORD_OAUTH_CLIENT_ID'),
        clientSecret: config.get('DISCORD_OAUTH_CLIENT_SECRET'),
        callbackURL: 'http://localhost:3000/auth/discord/callback',
        scope: discord_scopes,
    }, translateDiscordProfileToUser)
    browserDiscordStrategy.name = 'browserDiscord'
    passport.use(browserDiscordStrategy)

    var jwt_opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.get("JWT_SECRET"),
    }
    passport.use(new JwtStrategy(jwt_opts, function(jwt_payload, done) {
        db.user_profiles.findById(jwt_payload.user_id)
        .then(user => {
            done(null, user)
        })
        .catch(err => done(err))
    }));
}