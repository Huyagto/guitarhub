'use strict';

const { OK } = require('../../../../core');
const inventoryStaffService = require('../services');

const getInventory = async (req, res, next) => {
    try {
        const metadata = await inventoryStaffService.getInventory(req.user.id);
        return new OK({ message: 'Lấy tồn kho chi nhánh thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const receiveInventory = async (req, res, next) => {
    try {
        const metadata = await inventoryStaffService.receiveInventory(req.user.id, req.params.id, {
            quantity: Number(req.body.quantity),
            counterparty: req.body.counterparty,
            note: req.body.note,
        });
        return new OK({ message: 'Nhập kho thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const issueInventory = async (req, res, next) => {
    try {
        const metadata = await inventoryStaffService.issueInventory(req.user.id, req.params.id, {
            quantity: Number(req.body.quantity),
            counterparty: req.body.counterparty,
            note: req.body.note,
        });
        return new OK({ message: 'Xuất kho thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const getTransactions = async (req, res, next) => {
    try {
        const metadata = await inventoryStaffService.getTransactions(req.user.id);
        return new OK({ message: 'Lấy lịch sử kho thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getInventory,
    receiveInventory,
    issueInventory,
    getTransactions,
};
