'use strict';

const { body, param } = require('express-validator');
const { ORDER_STATUSES } = require('../../shared/constants');

const updateOrderStatusValidator = [
    param('id').isInt({ min: 1 }).withMessage('Id đơn hàng không hợp lệ'),
    body('status')
        .isIn(ORDER_STATUSES)
        .withMessage('Trạng thái đơn hàng không hợp lệ'),
];

module.exports = { updateOrderStatusValidator };
