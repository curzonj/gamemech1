'use strict';

// Hierarchical node.js configuration with command-line arguments, environment
// variables, and files.
const nconf = module.exports = require('nconf');
const path = require('path');


nconf
    // 1. Command-line arguments
    .argv()
    // 2. Environment variables
    .env([
        'OAUTH2_CLIENT_ID',
        'OAUTH2_CLIENT_SECRET',
        'OAUTH2_CALLBACK',
        'SESSION_SECRET',
        'DATABASE_URL',
    ])
    .defaults({

    })

requireValue('DATABASE_URL')
requireValue('OAUTH2_CLIENT_ID')
requireValue('OAUTH2_CLIENT_SECRET')
requireValue('OAUTH2_CALLBACK')
requireValue('SESSION_SECRET')

function requireValue(setting) {
    if (!nconf.get(setting)) {
        throw new Error(`You must set ${setting} as an environment variable!`);
    }
}