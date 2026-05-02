'use strict';

const { body } = require('express-validator');
const { CUSTOMER_PAYMENT_METHODS } = require('../constants/payment-customer.constants');

const createCheckoutValidator = [
    body('paymentMethod')
        .isIn(CUSTOMER_PAYMENT_METHODS)
        .withMessage('Phuong thuc thanh toan khong hop le'),
    body('branchId')
        .isInt({ min: 1 })
        .withMessage('Vui long chon chi nhanh con hang'),
    body('shippingInfo.recipientName').trim().notEmpty().withMessage('Nguoi nhan khong duoc de trong'),
    body('shippingInfo.phone').trim().notEmpty().withMessage('So dien thoai khong duoc de trong'),
    body('shippingInfo.province').trim().notEmpty().withMessage('Tinh/thanh pho khong duoc de trong'),
    body('shippingInfo.district').trim().notEmpty().withMessage('Quan/huyen khong duoc de trong'),
    body('shippingInfo.ward').trim().notEmpty().withMessage('Phuong/xa khong duoc de trong'),
    body('shippingInfo.detailAddress').trim().notEmpty().withMessage('Dia chi chi tiet khong duoc de trong'),
    body('shippingInfo.displayName').optional({ values: 'falsy' }).isString(),
    body('shippingInfo.lat').optional({ values: 'falsy' }).isString(),
    body('shippingInfo.lon').optional({ values: 'falsy' }).isString(),
];

module.exports = {
    createCheckoutValidator,
};
