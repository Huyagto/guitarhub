const { redis } = require('../../../config');
const { OTP_EXPIRES_MINUTES } = require('../../../core/utils');

const OTP_TTL_SECONDS = OTP_EXPIRES_MINUTES * 60;
const key = (email, purpose = 'reset') => `otp:${purpose}:${email}`;
const pendingRegistrationKey = (email) => `pending_registration:${email}`;

const save = async (email, otp, purpose = 'reset') => {
    await redis.set(key(email, purpose), otp, 'EX', OTP_TTL_SECONDS);
};

// Returns true if valid, false otherwise
const verify = async (email, otp, purpose = 'reset') => {
    const stored = await redis.get(key(email, purpose));
    return stored === otp;
};

const remove = async (email, purpose = 'reset') => {
    await redis.del(key(email, purpose));
};

const savePendingRegistration = async (email, payload) => {
    await redis.set(pendingRegistrationKey(email), JSON.stringify(payload), 'EX', OTP_TTL_SECONDS);
};

const getPendingRegistration = async (email) => {
    const raw = await redis.get(pendingRegistrationKey(email));
    return raw ? JSON.parse(raw) : null;
};

const removePendingRegistration = async (email) => {
    await redis.del(pendingRegistrationKey(email));
};

module.exports = {
    save,
    verify,
    remove,
    savePendingRegistration,
    getPendingRegistration,
    removePendingRegistration,
};
