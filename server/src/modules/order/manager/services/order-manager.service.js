'use strict';

const { NotFoundError, BadRequestError } = require('../../../../core');
const orderRepository = require('../../shared/repositories/order.repository');
const { toOrderResponseDto } = require('../../shared/dto/order.response.dto');
const { ORDER_STATUSES, ORDER_STATUS_TRANSITIONS } = require('../../shared/constants');
const { emitOrderUpdated } = require('../../../../realtime/socket.server');

const getOrders = async () => {
    const orders = await orderRepository.findMany();
    return orders.map(toOrderResponseDto);
};

const updateOrderStatus = async (id, status, handledByStaffId) => {
    if (!status) {
        throw new BadRequestError('Trạng thái đơn hàng là bắt buộc');
    }

    if (!ORDER_STATUSES.includes(status)) {
        throw new BadRequestError('Trạng thái đơn hàng không hợp lệ');
    }

    const currentOrder = await orderRepository.findById(id);
    if (!currentOrder) {
        throw new NotFoundError('Không tìm thấy đơn hàng');
    }

    const currentStatus = toOrderResponseDto(currentOrder).status;
    const allowedTransitions = ORDER_STATUS_TRANSITIONS[currentStatus] || [];

    if (currentStatus !== status && !allowedTransitions.includes(status)) {
        throw new BadRequestError('Không thể cập nhật đơn hàng theo trạng thái này');
    }

    const order = await orderRepository.updateStatus(id, status, handledByStaffId);
    const orderDto = toOrderResponseDto(order);
    emitOrderUpdated(orderDto);
    return orderDto;
};

module.exports = {
    getOrders,
    updateOrderStatus,
};
