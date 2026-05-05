'use strict';

const { body, param, query } = require('express-validator');
const { PRODUCT_STATUSES } = require('../../shared/constants/product.constants');

const branchInventoryValidator = [
    body('branchInventory').optional().isArray().withMessage('Tồn kho chi nhánh không hợp lệ'),
    body('branchInventory.*.branchId').optional().isInt({ min: 1 }).withMessage('Chi nhánh không hợp lệ'),
    body('branchInventory.*.stock').optional().isInt({ min: 0 }).withMessage('Tồn kho chi nhánh không hợp lệ'),
];

const getProductsValidator = [
    query('search').optional().isString(),
    query('category').optional().isString(),
    query('brand').optional().isString(),
];

const createProductValidator = [
    body('name').trim().notEmpty().withMessage('Tên sản phẩm không được để trống'),
    body('slug').trim().notEmpty().withMessage('Slug sản phẩm không được để trống'),
    body('sku').trim().notEmpty().withMessage('SKU không được để trống'),
    body('categoryId').isInt({ min: 1 }).withMessage('Danh mục không hợp lệ'),
    body('brandId').isInt({ min: 1 }).withMessage('Thương hiệu không hợp lệ'),
    body('price').isFloat({ min: 0 }).withMessage('Giá sản phẩm không hợp lệ'),
    ...branchInventoryValidator,
    body('image').optional({ values: 'falsy' }).isString(),
    body('shortDescription').optional({ values: 'falsy' }).isString(),
    body('description').optional({ values: 'falsy' }).isString(),
    body('status').optional().isIn(PRODUCT_STATUSES).withMessage('Trạng thái sản phẩm không hợp lệ'),
    body('isBestSeller').optional().isBoolean(),
    body('isNewArrival').optional().isBoolean(),
];

const updateProductValidator = [
    param('id').isInt({ min: 1 }).withMessage('Id sản phẩm không hợp lệ'),
    body('name').optional().trim().notEmpty().withMessage('Tên sản phẩm không được để trống'),
    body('slug').optional().trim().notEmpty().withMessage('Slug sản phẩm không được để trống'),
    body('sku').optional().trim().notEmpty().withMessage('SKU không được để trống'),
    body('categoryId').optional().isInt({ min: 1 }).withMessage('Danh mục không hợp lệ'),
    body('brandId').optional().isInt({ min: 1 }).withMessage('Thương hiệu không hợp lệ'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Giá sản phẩm không hợp lệ'),
    ...branchInventoryValidator,
    body('image').optional({ values: 'falsy' }).isString(),
    body('shortDescription').optional({ values: 'falsy' }).isString(),
    body('description').optional({ values: 'falsy' }).isString(),
    body('status').optional().isIn(PRODUCT_STATUSES).withMessage('Trạng thái sản phẩm không hợp lệ'),
    body('isBestSeller').optional().isBoolean(),
    body('isNewArrival').optional().isBoolean(),
];

const productIdParamValidator = [
    param('id').isInt({ min: 1 }).withMessage('Id sản phẩm không hợp lệ'),
];

module.exports = {
    getProductsValidator,
    createProductValidator,
    updateProductValidator,
    productIdParamValidator,
};
