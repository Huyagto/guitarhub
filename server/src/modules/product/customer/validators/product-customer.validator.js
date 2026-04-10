'use strict';

const { query, param } = require('express-validator');

const getProductsValidator = [
    query('search').optional().isString(),
    query('category').optional().isString(),
    query('brand').optional().isString(),
];

const productSlugParamValidator = [
    param('slug').trim().notEmpty().withMessage('Slug sản phẩm không được để trống'),
];

module.exports = {
    getProductsValidator,
    productSlugParamValidator,
};
