'use strict';

const { body } = require('express-validator');

module.exports = [
    body('id').notEmpty().withMessage('Mã địa chỉ không được để trống'),
    body('userId').optional().isString(),
    body('recipientName').trim().notEmpty().withMessage('Người nhận không được để trống'),
    body('phone').optional({ checkFalsy: true }).trim().isString(),
    body('province').trim().notEmpty().withMessage('Tỉnh / Thành phố không được để trống'),
    body('district').trim().notEmpty().withMessage('Quận / Huyện không được để trống'),
    body('ward').trim().notEmpty().withMessage('Phường / Xã không được để trống'),
    body('detailAddress').trim().notEmpty().withMessage('Địa chỉ chi tiết không được để trống'),
    body('displayName').trim().notEmpty().withMessage('Tên hiển thị địa chỉ không được để trống'),
    body('lat').trim().notEmpty().withMessage('Vĩ độ không được để trống'),
    body('lon').trim().notEmpty().withMessage('Kinh độ không được để trống'),
    body('isDefault').optional().isBoolean(),
];
