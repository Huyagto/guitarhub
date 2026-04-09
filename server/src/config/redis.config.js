const Redis = require('ioredis');
const { redisUrl } = require('./env.config');

const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
});

redis.on('connect', () => console.log('Connected to Redis'));
redis.on('error', (err) => console.error('Redis error:', err.message));

module.exports = redis;
