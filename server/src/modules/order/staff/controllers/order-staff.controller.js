'use strict';

const { OK, Created } = require('../../../../core');
const { validateRequest } = require('../../../../common');
const orderStaffService = require('../services/order-staff.service');

const getOrders = async (req, res, next) => {
    try {
        const metadata = await orderStaffService.getOrders(req.user.id);
        return new OK({ message: 'Lay danh sach don hang thanh cong', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const getOrderHistory = async (req, res, next) => {
    try {
        const metadata = await orderStaffService.getOrderHistory(req.user.id);
        return new OK({ message: 'Lay lich su don hang thanh cong', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const updateOrderStatus = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await orderStaffService.updateOrderStatus(req.params.id, req.body.status, req.user.id);
        return new OK({ message: 'Cap nhat trang thai don hang thanh cong', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const createPosOrder = async (req, res, next) => {
    try {
        const metadata = await orderStaffService.createPosOrder(req.user.id, req.body);
        return new Created({ message: 'Tao don hang POS thanh cong', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const updatePosOrder = async (req, res, next) => {
    try {
        const metadata = await orderStaffService.updatePosOrder(req.user.id, req.params.id, req.body);
        return new OK({ message: 'Cap nhat don POS thanh cong', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const cancelPosOrder = async (req, res, next) => {
    try {
        const metadata = await orderStaffService.cancelPosOrder(req.user.id, req.params.id, req.body);
        return new OK({ message: 'Huy don POS thanh cong', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getOrders,
    getOrderHistory,
    updateOrderStatus,
    createPosOrder,
    updatePosOrder,
    cancelPosOrder,
};
