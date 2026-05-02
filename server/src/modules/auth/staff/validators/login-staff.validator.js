'use strict';

const { body } = require('express-validator');

module.exports = [
    body('staffCode').trim().notEmpty().withMessage('Mã nhân viên không được để trống'),
    body('password').notEmpty().withMessage('Mật khẩu không được để trống'),
];
