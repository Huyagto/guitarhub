const { redis } = require('../../../config');
const { OTP_EXPIRES_MINUTES } = require('../../../core/utils');

const OTP_TTL_SECONDS = OTP_EXPIRES_MINUTES * 60;
const key = (email) => `otp:reset:${email}`;

const save = async (email, otp) => {
    await redis.set(key(email), otp, 'EX', OTP_TTL_SECONDS);
};

// Returns true if valid, false otherwise
const verify = async (email, otp) => {
    const stored = await redis.get(key(email));
    return stored === otp;
};

const remove = async (email) => {
    await redis.del(key(email));
};

module.exports = { save, verify, remove };
