'use strict';

const { NotFoundError, BadRequestError } = require('../../../../core');
const inventoryRepository = require('../../shared/repositories/inventory.repository');
const { toInventoryResponseDto } = require('../../shared/dto/inventory.response.dto');

const getInventory = async () => inventoryRepository.findMany().map(toInventoryResponseDto);

const restockInventory = async (id, quantity) => {
    if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new BadRequestError('Số lượng nhập thêm phải lớn hơn 0');
    }

    const item = inventoryRepository.restock(id, quantity);
    if (!item) {
        throw new NotFoundError('Không tìm thấy mặt hàng tồn kho');
    }

    return toInventoryResponseDto(item);
};

module.exports = {
    getInventory,
    restockInventory,
};
