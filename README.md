# Scripts and commands

Everything is defined in `package.json` in `scripts`.

# Database

```bash
cd api
npm run migrate 0
npm run migrate
npm run seed
```

# Style Guide

You'll find things that don't follow these guides, feel free to correct it.

* [Google JSON Style Guide](https://google.github.io/styleguide/jsoncstyleguide.xml)
* [Airbnb JS Style Guide](https://github.com/airbnb/javascript)

## Highlights

* CamelCase everything (js files incliuded), except postgresql db columns
* Use semi-colons
* Use single quotes