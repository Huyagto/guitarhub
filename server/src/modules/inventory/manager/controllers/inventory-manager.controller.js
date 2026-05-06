'use strict';

const { OK } = require('../../../../core');
const { validateRequest } = require('../../../../common');
const inventoryManagerService = require('../services/inventory-manager.service');

const getInventory = async (req, res, next) => {
    try {
        const metadata = await inventoryManagerService.getInventory({ branchId: req.query.branchId });
        return new OK({ message: 'Lấy tồn kho thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const restockInventory = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await inventoryManagerService.restockInventory(req.params.id, Number(req.body.quantity), {
            staffId: req.user.id,
            counterparty: req.body.counterparty,
            note: req.body.note,
        });
        return new OK({ message: 'Nhập thêm hàng thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const issueInventory = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await inventoryManagerService.issueInventory(req.params.id, Number(req.body.quantity), {
            staffId: req.user.id,
            counterparty: req.body.counterparty,
            note: req.body.note,
        });
        return new OK({ message: 'Xuất kho thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const stocktakeInventory = async (req, res, next) => {
    try {
        const metadata = await inventoryManagerService.stocktakeInventory(req.params.id, Number(req.body.actualStock), {
            staffId: req.user.id,
            note: req.body.note,
        });
        return new OK({ message: 'Kiểm kê tồn kho thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const getInventoryTransactions = async (req, res, next) => {
    try {
        const metadata = await inventoryManagerService.getInventoryTransactions(req.query);
        return new OK({ message: 'Lấy lịch sử kho thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getInventory,
    restockInventory,
    issueInventory,
    stocktakeInventory,
    getInventoryTransactions,
};
