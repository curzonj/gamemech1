# Scripts and commands

Everything is defined in `package.json` in `scripts`.

# Database

```bash
cd api
npm run migrate
npm run seed
```

# Discord Oauth

https://discordapp.com/developers/applications/#top

# Heroku Config vars

```
DATABASE_URL:                  ....
DISCORD_CALLBACK_URL:          https://gamemech1.herokuapp.com/auth/discord/callback
DISCORD_OAUTH_CLIENT_ID:       ....
DISCORD_OAUTH_CLIENT_SECRET:   ....
JWT_SECRET:                    ....
PUBLIC_URL:                    https://gamemech1.herokuapp.com
REACT_APP_API_ENDPOINT:        https://gamemech1.herokuapp.com
REACT_APP_OAUTH_AUTHORIZE_URI: https://discordapp.com/api/oauth2/authorize?client_id=.....
REACT_APP_OAUTH_CALLBACK_PATH: /oauth_callback
SESSION_SECRET:                ....
```

# Style Guide

You'll find things that don't follow these guides, feel free to correct it.

- [Google JSON Style Guide](https://google.github.io/styleguide/jsoncstyleguide.xml)
- [Airbnb JS Style Guide](https://github.com/airbnb/javascript)

## Highlights

- CamelCase everything (js files incliuded), except postgresql db columns
- Use semi-colons
- Use single quotes
