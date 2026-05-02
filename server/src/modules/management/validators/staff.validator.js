'use strict';

const { body } = require('express-validator');

const createStaffValidator = [
    body('fullName').trim().notEmpty().withMessage('Họ và tên không được để trống'),
    body('email').isEmail().normalizeEmail().withMessage('Email không hợp lệ'),
    body('phone').optional({ checkFalsy: true }).trim().isString(),
    body('branchId').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('Chi nhanh khong hop le'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
];

const updateStaffValidator = [
    body('fullName').optional().trim().notEmpty().withMessage('Họ và tên không được để trống'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Email không hợp lệ'),
    body('phone').optional({ checkFalsy: true }).trim().isString(),
    body('branchId').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('Chi nhanh khong hop le'),
    body('isActive').optional().isBoolean(),
];

const resetStaffPasswordValidator = [
    body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
];

module.exports = { createStaffValidator, updateStaffValidator, resetStaffPasswordValidator };
