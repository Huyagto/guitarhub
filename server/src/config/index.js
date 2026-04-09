'use strict';

const env = require('./env.config');

const config = { ...env };

Object.defineProperty(config, 'database', {
    enumerable: true,
    get: () => require('./database.config'),
});

Object.defineProperty(config, 'redis', {
    enumerable: true,
    get: () => require('./redis.config'),
});

module.exports = config;
