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
        const metadata = await inventoryManagerService.restockInventory(req.params.id, Number(req.body.quantity));
        return new OK({ message: 'Nhập thêm hàng thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getInventory,
    restockInventory,
};
