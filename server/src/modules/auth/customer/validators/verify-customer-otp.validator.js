'use strict';

const { body } = require('express-validator');

module.exports = [
    body('email').isEmail().normalizeEmail().withMessage('Email không hợp lệ'),
    body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Mã OTP phải là 6 chữ số'),
];
