'use strict';

const { NotFoundError, BadRequestError } = require('../../../../core');
const orderRepository = require('../../shared/repositories/order.repository');
const { toOrderResponseDto } = require('../../shared/dto/order.response.dto');

const getOrders = async () => orderRepository.findMany().map(toOrderResponseDto);

const updateOrderStatus = async (id, status) => {
    if (!status) {
        throw new BadRequestError('Trạng thái đơn hàng là bắt buộc');
    }

    const order = orderRepository.updateStatus(id, status);
    if (!order) {
        throw new NotFoundError('Không tìm thấy đơn hàng');
    }

    return toOrderResponseDto(order);
};

module.exports = {
    getOrders,
    updateOrderStatus,
};
