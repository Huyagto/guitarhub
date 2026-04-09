'use strict';

const { body } = require('express-validator');

module.exports = [
    body('email').isEmail().normalizeEmail().withMessage('Email không hợp lệ'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body('fullName').trim().notEmpty().withMessage('Họ và tên không được để trống'),
];
