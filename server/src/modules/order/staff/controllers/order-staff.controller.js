'use strict';

const { OK, Created } = require('../../../../core');
const { validateRequest } = require('../../../../common');
const orderStaffService = require('../services/order-staff.service');

const getOrders = async (req, res, next) => {
    try {
        const metadata = await orderStaffService.getOrders();
        return new OK({ message: 'Lấy danh sách đơn hàng thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const updateOrderStatus = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await orderStaffService.updateOrderStatus(req.params.id, req.body.status, req.user.id);
        return new OK({ message: 'Cập nhật trạng thái đơn hàng thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const createPosOrder = async (req, res, next) => {
    try {
        const metadata = await orderStaffService.createPosOrder(req.user.id, req.body);
        return new Created({ message: 'Tạo đơn hàng POS thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getOrders,
    updateOrderStatus,
    createPosOrder,
};
