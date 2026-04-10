'use strict';

const store = require('../../../management/data/management.store');

const findMany = () => store.getCollection('orders');

const updateStatus = (id, status) => store.updateOrderStatus(id, status);

module.exports = {
    findMany,
    updateStatus,
};
