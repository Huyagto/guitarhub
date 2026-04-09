'use strict';

const { redis } = require('../../../config');

const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60; // 30 ngày (giây)
const key = (userId) => `refresh_token:${userId}`;

const save = async (userId, token) => {
    await redis.set(key(userId), token, 'EX', REFRESH_TOKEN_TTL);
};

const get = async (userId) => {
    return redis.get(key(userId));
};

const remove = async (userId) => {
    await redis.del(key(userId));
};

module.exports = { save, get, remove };
