'use strict';

const { body, param } = require('express-validator');

const addCartItemValidator = [
    body('productId').isInt({ min: 1 }).withMessage('Id sản phẩm không hợp lệ'),
    body('quantity').isInt({ min: 1 }).withMessage('Số lượng phải lớn hơn 0'),
];

const updateCartItemValidator = [
    param('itemId').isInt({ min: 1 }).withMessage('Id item giỏ hàng không hợp lệ'),
    body('quantity').isInt({ min: 1 }).withMessage('Số lượng phải lớn hơn 0'),
];

const cartItemIdParamValidator = [
    param('itemId').isInt({ min: 1 }).withMessage('Id item giỏ hàng không hợp lệ'),
];

module.exports = {
    addCartItemValidator,
    updateCartItemValidator,
    cartItemIdParamValidator,
};
