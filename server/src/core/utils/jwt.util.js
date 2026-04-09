const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn, jwtRefreshSecret, jwtRefreshExpiresIn } = require('../../config');
const { BadRequestError } = require('../error.response');

const generateAccessToken = (payload) => {
    return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
};

const generateRefreshToken = (payload) => {
    return jwt.sign(payload, jwtRefreshSecret, { expiresIn: jwtRefreshExpiresIn });
};

// Short-lived token after OTP verified — used only for /reset-password
const generateResetToken = (payload) => {
    return jwt.sign({ ...payload, purpose: 'password_reset' }, jwtSecret, { expiresIn: '15m' });
};

const verifyAccessToken = (token) => {
    return jwt.verify(token, jwtSecret);
};

const verifyRefreshToken = (token) => {
    return jwt.verify(token, jwtRefreshSecret);
};

const verifyResetToken = (token) => {
    const decoded = jwt.verify(token, jwtSecret);
    if (decoded.purpose !== 'password_reset') throw new BadRequestError('Token đặt lại mật khẩu không hợp lệ');
    return decoded;
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generateResetToken,
    verifyAccessToken,
    verifyRefreshToken,
    verifyResetToken,
};
