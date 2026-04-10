'use strict';

const { OK } = require('../../../../core');
const { validateRequest } = require('../../../../common');
const orderManagerService = require('../services/order-manager.service');

const getOrders = async (req, res, next) => {
    try {
        const metadata = await orderManagerService.getOrders();
        return new OK({ message: 'Lấy đơn hàng thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const updateOrderStatus = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await orderManagerService.updateOrderStatus(req.params.id, req.body.status);
        return new OK({ message: 'Cập nhật trạng thái đơn hàng thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getOrders,
    updateOrderStatus,
};
