'use strict';

const { body, param, query } = require('express-validator');
const { CATEGORY_STATUSES } = require('../../shared/constants/category.constants');

const getCategoriesValidator = [
    query('search').optional().isString(),
    query('status').optional().isIn(CATEGORY_STATUSES).withMessage('Trạng thái danh mục không hợp lệ'),
];

const createCategoryValidator = [
    body('name').trim().notEmpty().withMessage('Tên danh mục không được để trống'),
    body('slug').trim().notEmpty().withMessage('Slug không được để trống'),
    body('description').optional({ values: 'falsy' }).isString(),
    body('image').optional({ values: 'falsy' }).isString(),
    body('status').optional().isIn(CATEGORY_STATUSES).withMessage('Trạng thái danh mục không hợp lệ'),
];

const updateCategoryValidator = [
    param('id').isInt({ min: 1 }).withMessage('Id danh mục không hợp lệ'),
    body('name').optional().trim().notEmpty().withMessage('Tên danh mục không được để trống'),
    body('slug').optional().trim().notEmpty().withMessage('Slug không được để trống'),
    body('description').optional({ values: 'falsy' }).isString(),
    body('image').optional({ values: 'falsy' }).isString(),
    body('status').optional().isIn(CATEGORY_STATUSES).withMessage('Trạng thái danh mục không hợp lệ'),
];

const categoryIdParamValidator = [
    param('id').isInt({ min: 1 }).withMessage('Id danh mục không hợp lệ'),
];

module.exports = {
    getCategoriesValidator,
    createCategoryValidator,
    updateCategoryValidator,
    categoryIdParamValidator,
};
