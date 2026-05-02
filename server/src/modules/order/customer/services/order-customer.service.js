'use strict';

const orderRepository = require('../../shared/repositories/order.repository');
const { toOrderResponseDto } = require('../../shared/dto/order.response.dto');

const getOrders = async (customerId) => {
    const orders = await orderRepository.findMany({ customerId });
    return orders.map(toOrderResponseDto);
};

module.exports = {
    getOrders,
};
