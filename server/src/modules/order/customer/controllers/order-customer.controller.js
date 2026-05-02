'use strict';

const { OK } = require('../../../../core');
const orderCustomerService = require('../services/order-customer.service');

const getOrders = async (req, res, next) => {
    try {
        const metadata = await orderCustomerService.getOrders(req.user.id);
        return new OK({ message: 'Lay lich su don hang thanh cong', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getOrders,
};
