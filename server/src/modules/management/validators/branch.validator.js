'use strict';

const { body, param } = require('express-validator');

const branchStatusValues = ['ACTIVE', 'INACTIVE'];

const createBranchValidator = [
    body('name').trim().notEmpty().withMessage('Tên chi nhánh không được để trống'),
    body('code').trim().notEmpty().withMessage('Mã chi nhánh không được để trống'),
    body('address').trim().notEmpty().withMessage('Địa chỉ cửa hàng không được để trống'),
    body('phone').optional({ values: 'falsy' }).isString(),
    body('latitude').optional({ values: 'falsy' }).isFloat({ min: -90, max: 90 }).withMessage('Vĩ độ chi nhánh không hợp lệ'),
    body('longitude').optional({ values: 'falsy' }).isFloat({ min: -180, max: 180 }).withMessage('Kinh độ chi nhánh không hợp lệ'),
    body('status').optional().isIn(branchStatusValues).withMessage('Trạng thái chi nhánh không hợp lệ'),
];

const updateBranchValidator = [
    param('id').isInt({ min: 1 }).withMessage('Id chi nhánh không hợp lệ'),
    body('name').optional().trim().notEmpty().withMessage('Tên chi nhánh không được để trống'),
    body('code').optional().trim().notEmpty().withMessage('Mã chi nhánh không được để trống'),
    body('address').optional().trim().notEmpty().withMessage('Địa chỉ cửa hàng không được để trống'),
    body('phone').optional({ values: 'falsy' }).isString(),
    body('latitude').optional({ values: 'falsy' }).isFloat({ min: -90, max: 90 }).withMessage('Vĩ độ chi nhánh không hợp lệ'),
    body('longitude').optional({ values: 'falsy' }).isFloat({ min: -180, max: 180 }).withMessage('Kinh độ chi nhánh không hợp lệ'),
    body('status').optional().isIn(branchStatusValues).withMessage('Trạng thái chi nhánh không hợp lệ'),
];

module.exports = {
    createBranchValidator,
    updateBranchValidator,
};
