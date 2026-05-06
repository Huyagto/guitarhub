'use strict';

const { body } = require('express-validator');

module.exports = [
    body('fullName').trim().notEmpty().withMessage('Họ và tên không được để trống'),
    body('phone').optional({ checkFalsy: true }).trim().isString(),
    body('avatar').optional({ checkFalsy: true }).trim().isURL().withMessage('Ảnh đại diện không hợp lệ'),
];
