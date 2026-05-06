'use strict';

const { BadRequestError, NotFoundError } = require('../../../../core');
const orderRepository = require('../../shared/repositories/order.repository');
const { toOrderResponseDto } = require('../../shared/dto/order.response.dto');

const getOrders = async (customerId) => {
    const orders = await orderRepository.findMany({ customerId });
    return orders.map(toOrderResponseDto);
};

const getOrderById = async (customerId, orderId) => {
    const order = await orderRepository.findById(orderId);
    if (!order || Number(order.customerId) !== Number(customerId)) {
        throw new NotFoundError('Khong tim thay don hang');
    }

    return toOrderResponseDto(order);
};

const cancelOrder = async (customerId, orderId) => {
    const order = await orderRepository.findById(orderId);
    if (!order || Number(order.customerId) !== Number(customerId)) {
        throw new NotFoundError('Khong tim thay don hang');
    }

    const orderDto = toOrderResponseDto(order);
    const cancelableStatuses = ['awaiting_payment', 'pending_confirmation', 'confirmed'];
    if (!cancelableStatuses.includes(orderDto.status)) {
        throw new BadRequestError('Don hang nay khong the huy');
    }

    const updatedOrder = await orderRepository.updateStatus(orderId, 'cancelled', null, 'Khach hang huy don', customerId);
    return toOrderResponseDto(updatedOrder);
};

module.exports = {
    getOrders,
    getOrderById,
    cancelOrder,
};
