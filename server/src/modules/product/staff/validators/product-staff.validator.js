'use strict';

const { query, param } = require('express-validator');

const getProductsValidator = [
    query('search').optional().isString(),
    query('category').optional().isString(),
    query('brand').optional().isString(),
];

const productIdParamValidator = [
    param('id').isInt({ min: 1 }).withMessage('Id sản phẩm không hợp lệ'),
];

module.exports = {
    getProductsValidator,
    productIdParamValidator,
};
