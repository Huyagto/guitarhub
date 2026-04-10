'use strict';

const { body, param } = require('express-validator');

const restockInventoryValidator = [
    param('id').notEmpty().withMessage('Id tồn kho không hợp lệ'),
    body('quantity').isInt({ min: 1 }).withMessage('Số lượng nhập thêm phải lớn hơn 0'),
];

module.exports = { restockInventoryValidator };
