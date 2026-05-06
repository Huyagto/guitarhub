'use strict';

const { NotFoundError, BadRequestError } = require('../../../../core');
const inventoryRepository = require('../../shared/repositories/inventory.repository');
const { toInventoryResponseDto } = require('../../shared/dto/inventory.response.dto');

const getInventory = async ({ branchId } = {}) => (await inventoryRepository.findMany({ branchId })).map(toInventoryResponseDto);

const ensurePositiveQuantity = (quantity, message) => {
    if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new BadRequestError(message);
    }
};

const runStockAdjustment = async (id, payload) => {
    try {
        const item = await inventoryRepository.adjustStock(id, payload);
        if (!item) throw new Error('NOT_FOUND');
        return toInventoryResponseDto(item);
    } catch (error) {
        if (error.message === 'INSUFFICIENT_STOCK') {
            throw new BadRequestError('Tồn kho không đủ để xuất');
        }
        throw new NotFoundError('Không tìm thấy mặt hàng tồn kho');
    }
};

const restockInventory = async (id, quantity, options = {}) => {
    ensurePositiveQuantity(quantity, 'Số lượng nhập thêm phải lớn hơn 0');
    return runStockAdjustment(id, {
        ...options,
        type: 'RECEIVE',
        quantity,
    });
};

const issueInventory = async (id, quantity, options = {}) => {
    ensurePositiveQuantity(quantity, 'Số lượng xuất phải lớn hơn 0');
    return runStockAdjustment(id, {
        ...options,
        type: 'ISSUE',
        quantity,
    });
};

const stocktakeInventory = async (id, actualStock, options = {}) => {
    if (!Number.isInteger(actualStock) || actualStock < 0) {
        throw new BadRequestError('Số lượng kiểm kê không hợp lệ');
    }

    const current = (await inventoryRepository.findMany({}))
        .find((item) => item.id === String(id));
    if (!current) throw new NotFoundError('Không tìm thấy mặt hàng tồn kho');

    const delta = actualStock - current.currentStock;
    if (delta === 0) return current;

    return runStockAdjustment(id, {
        ...options,
        type: 'STOCKTAKE',
        quantity: Math.abs(delta),
        stockDelta: delta,
    });
};

const getInventoryTransactions = async (filters = {}) => inventoryRepository.findTransactions(filters);

module.exports = {
    getInventory,
    restockInventory,
    issueInventory,
    stocktakeInventory,
    getInventoryTransactions,
};
