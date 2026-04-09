'use strict';

const { body } = require('express-validator');

module.exports = [
    body('resetToken').notEmpty().withMessage('Token đặt lại mật khẩu không được để trống'),
    body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
];
