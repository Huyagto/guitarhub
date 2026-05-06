'use strict';

const { OK } = require('../../../../core');
const orderCustomerService = require('../services/order-customer.service');

const getOrders = async (req, res, next) => {
    try {
        const metadata = await orderCustomerService.getOrders(req.user.id);
        return new OK({ message: 'Lay lich su don hang thanh cong', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const getOrderById = async (req, res, next) => {
    try {
        const metadata = await orderCustomerService.getOrderById(req.user.id, req.params.id);
        return new OK({ message: 'Lay chi tiet don hang thanh cong', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const cancelOrder = async (req, res, next) => {
    try {
        const metadata = await orderCustomerService.cancelOrder(req.user.id, req.params.id);
        return new OK({ message: 'Huy don hang thanh cong', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getOrders,
    getOrderById,
    cancelOrder,
};
