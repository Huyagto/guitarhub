'use strict';

const { NotFoundError, BadRequestError } = require('../../../../core');
const inventoryRepository = require('../../shared/repositories/inventory.repository');
const { toInventoryResponseDto } = require('../../shared/dto/inventory.response.dto');

const getInventory = async ({ branchId } = {}) => (await inventoryRepository.findMany({ branchId })).map(toInventoryResponseDto);

const restockInventory = async (id, quantity) => {
    if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new BadRequestError('Sá»‘ lÆ°á»£ng nháº­p thÃªm pháº£i lá»›n hÆ¡n 0');
    }

    try {
        const item = await inventoryRepository.restock(id, quantity);
        return toInventoryResponseDto(item);
    } catch (error) {
        throw new NotFoundError('KhÃ´ng tÃ¬m tháº¥y máº·t hÃ ng tá»“n kho');
    }
};

module.exports = {
    getInventory,
    restockInventory,
};
