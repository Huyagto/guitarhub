'use strict';

const { query, param } = require('express-validator');
const { CATEGORY_STATUSES } = require('../../shared/constants/category.constants');

const getCategoriesValidator = [
    query('search').optional().isString(),
    query('status').optional().isIn(CATEGORY_STATUSES).withMessage('Trạng thái danh mục không hợp lệ'),
];

const categoryIdParamValidator = [
    param('id').isInt({ min: 1 }).withMessage('Id danh mục không hợp lệ'),
];

module.exports = {
    getCategoriesValidator,
    categoryIdParamValidator,
};
