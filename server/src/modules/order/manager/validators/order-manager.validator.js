'use strict';

const { body, param } = require('express-validator');

const updateOrderStatusValidator = [
    param('id').notEmpty().withMessage('Id đơn hàng không hợp lệ'),
    body('status').notEmpty().withMessage('Trạng thái đơn hàng không được để trống'),
];

module.exports = { updateOrderStatusValidator };
