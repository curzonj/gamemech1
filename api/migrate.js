#!/usr/bin/env node


const nconf = require('nconf');

nconf
  .env()
  .file({
    file: '.env.json',
  });

const database_url = nconf.get('DATABASE_URL');
if (database_url === undefined) {
  console.log('export DATABASE_URL or set in .env.json');
  process.exit(1);
}

const Postgrator = require('postgrator');

const postgrator = new Postgrator({
  migrationDirectory: `${__dirname}/migrations`,
  driver: 'pg',
  connectionString: database_url,
});

postgrator.migrate(process.argv[2])
  .then(appliedMigrations => console.log(appliedMigrations))
  .catch((error) => {
    console.log(error);
    // Because migrations prior to the migration with error would have run
    // error object is decorated with appliedMigrations
    console.log(error.appliedMigrations); // array of migration objects
    process.exit(1)
  });
