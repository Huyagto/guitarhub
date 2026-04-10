'use strict';

const { OK, Created } = require('../../../../core');
const { validateRequest } = require('../../../../common');
const cartCustomerService = require('../services/cart-customer.service');

const getCart = async (req, res, next) => {
    try {
        const metadata = await cartCustomerService.getCart(req.user.id);
        return new OK({ message: 'Lấy giỏ hàng thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const addItem = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await cartCustomerService.addItemToCart(req.user.id, req.body);
        return new Created({ message: 'Thêm sản phẩm vào giỏ hàng thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const updateItem = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await cartCustomerService.updateCartItemQuantity(req.user.id, Number(req.params.itemId), Number(req.body.quantity));
        return new OK({ message: 'Cập nhật giỏ hàng thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const removeItem = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await cartCustomerService.removeCartItem(req.user.id, Number(req.params.itemId));
        return new OK({ message: 'Xóa sản phẩm khỏi giỏ hàng thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const clearCart = async (req, res, next) => {
    try {
        const metadata = await cartCustomerService.clearCustomerCart(req.user.id);
        return new OK({ message: 'Xóa toàn bộ giỏ hàng thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
};
