'use strict';

const { BadRequestError, NotFoundError } = require('../../../core');
const store = require('../data/management.store');

const assertCollection = (collection) => {
    if (!store.collections.includes(collection)) {
        throw new BadRequestError('Collection không hợp lệ');
    }
};

const getCollectionItems = (collection) => {
    assertCollection(collection);
    return store.getCollection(collection);
};

const createCollectionItem = (collection, payload) => {
    assertCollection(collection);
    return store.createItem(collection, payload);
};

const updateCollectionItem = (collection, id, payload) => {
    assertCollection(collection);
    const item = store.updateItem(collection, id, payload);
    if (!item) throw new NotFoundError('Không tìm thấy dữ liệu cần cập nhật');
    return item;
};

const deleteCollectionItem = (collection, id) => {
    assertCollection(collection);
    const item = store.removeItem(collection, id);
    if (!item) throw new NotFoundError('Không tìm thấy dữ liệu cần xóa');
    return item;
};

const getDashboardOverview = () => store.getDashboardOverview();

const getReportsSummary = () => store.getReportsSummary();

const restockInventoryItem = (id, quantity) => {
    if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new BadRequestError('Số lượng nhập thêm phải lớn hơn 0');
    }

    const item = store.restockInventoryItem(id, quantity);
    if (!item) throw new NotFoundError('Không tìm thấy mặt hàng tồn kho');
    return item;
};

const updateOrderStatus = (id, status) => {
    if (!status) throw new BadRequestError('Trạng thái đơn hàng là bắt buộc');
    const order = store.updateOrderStatus(id, status);
    if (!order) throw new NotFoundError('Không tìm thấy đơn hàng');
    return order;
};

const getPosCatalog = () => store.getPosCatalog();

module.exports = {
    getCollectionItems,
    createCollectionItem,
    updateCollectionItem,
    deleteCollectionItem,
    getDashboardOverview,
    getReportsSummary,
    restockInventoryItem,
    updateOrderStatus,
    getPosCatalog,
};
