'use strict';

const { Created, OK } = require('../../../core');
const managementService = require('../services/management.service');

const getCollection = (collection) => (req, res, next) => {
    try {
        const metadata = managementService.getCollectionItems(collection);
        return new OK({ message: 'Lấy dữ liệu thành công', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

const createCollectionItem = (collection) => (req, res, next) => {
    try {
        const metadata = managementService.createCollectionItem(collection, req.body);
        return new Created({ message: 'Tạo dữ liệu thành công', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

const updateCollectionItem = (collection) => (req, res, next) => {
    try {
        const metadata = managementService.updateCollectionItem(collection, req.params.id, req.body);
        return new OK({ message: 'Cập nhật dữ liệu thành công', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

const deleteCollectionItem = (collection) => (req, res, next) => {
    try {
        const metadata = managementService.deleteCollectionItem(collection, req.params.id);
        return new OK({ message: 'Xóa dữ liệu thành công', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

const getDashboardOverview = (req, res, next) => {
    try {
        const metadata = managementService.getDashboardOverview();
        return new OK({ message: 'Lấy tổng quan dashboard thành công', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

const getReportsSummary = (req, res, next) => {
    try {
        const metadata = managementService.getReportsSummary();
        return new OK({ message: 'Lấy dữ liệu báo cáo thành công', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

const restockInventoryItem = (req, res, next) => {
    try {
        const metadata = managementService.restockInventoryItem(req.params.id, Number(req.body.quantity));
        return new OK({ message: 'Nhập thêm hàng thành công', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

const updateOrderStatus = (req, res, next) => {
    try {
        const metadata = managementService.updateOrderStatus(req.params.id, req.body.status);
        return new OK({ message: 'Cập nhật trạng thái đơn hàng thành công', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

const getPosCatalog = (req, res, next) => {
    try {
        const metadata = managementService.getPosCatalog();
        return new OK({ message: 'Lấy danh mục POS thành công', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCollection,
    createCollectionItem,
    updateCollectionItem,
    deleteCollectionItem,
    getDashboardOverview,
    getReportsSummary,
    restockInventoryItem,
    updateOrderStatus,
    getPosCatalog,
};
