const config = require('../config')
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });

    const DiscordStrategy = require('passport-discord').Strategy;
    passport.use(new DiscordStrategy({
        clientID: config.get('DISCORD_OAUTH_CLIENT_ID'),
        clientSecret: config.get('DISCORD_OAUTH_CLIENT_SECRET'),
        callbackURL: 'http://localhost:3001/auth/discord/callback',
        scope: [ 'identify', 'email' ]
    },
    function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
            return done(null, profile);
        });
    }));

    const browserDiscordStrategy = new DiscordStrategy({
        clientID: config.get('DISCORD_OAUTH_CLIENT_ID'),
        clientSecret: config.get('DISCORD_OAUTH_CLIENT_SECRET'),
        callbackURL: 'http://localhost:3000/auth/discord/callback',
        scope: [ 'identify', 'email' ]
    },
    function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
            return done(null, profile);
        });
    });
    browserDiscordStrategy.name = 'browserDiscord'
    passport.use(browserDiscordStrategy)

    var jwt_opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.get("JWT_SECRET"),
    }
    passport.use(new JwtStrategy(jwt_opts, function(jwt_payload, done) {
        done(null, jwt_payload)
    }));

}