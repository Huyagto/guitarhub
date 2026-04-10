'use strict';

const { body, param, query } = require('express-validator');
const { BRAND_STATUSES } = require('../../shared/constants/brand.constants');

const getBrandsValidator = [
    query('search').optional().isString(),
    query('status').optional().isIn(BRAND_STATUSES).withMessage('Trạng thái thương hiệu không hợp lệ'),
];

const createBrandValidator = [
    body('name').trim().notEmpty().withMessage('Tên thương hiệu không được để trống'),
    body('slug').trim().notEmpty().withMessage('Slug không được để trống'),
    body('description').optional({ values: 'falsy' }).isString(),
    body('logo').optional({ values: 'falsy' }).isString(),
    body('status').optional().isIn(BRAND_STATUSES).withMessage('Trạng thái thương hiệu không hợp lệ'),
];

const updateBrandValidator = [
    param('id').isInt({ min: 1 }).withMessage('Id thương hiệu không hợp lệ'),
    body('name').optional().trim().notEmpty().withMessage('Tên thương hiệu không được để trống'),
    body('slug').optional().trim().notEmpty().withMessage('Slug không được để trống'),
    body('description').optional({ values: 'falsy' }).isString(),
    body('logo').optional({ values: 'falsy' }).isString(),
    body('status').optional().isIn(BRAND_STATUSES).withMessage('Trạng thái thương hiệu không hợp lệ'),
];

const brandIdParamValidator = [
    param('id').isInt({ min: 1 }).withMessage('Id thương hiệu không hợp lệ'),
];

module.exports = {
    getBrandsValidator,
    createBrandValidator,
    updateBrandValidator,
    brandIdParamValidator,
};
