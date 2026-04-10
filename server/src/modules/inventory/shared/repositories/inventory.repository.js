'use strict';

const store = require('../../../management/data/management.store');

const findMany = () => store.getCollection('inventory');

const restock = (id, quantity) => store.restockInventoryItem(id, quantity);

module.exports = {
    findMany,
    restock,
};
