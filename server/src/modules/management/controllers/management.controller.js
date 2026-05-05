'use strict';

const { Created, OK } = require('../../../core');
const { validateRequest } = require('../../auth/shared/utils');
const managementService = require('../services/management.service');

const getCollection = (collection) => (req, res, next) => {
    try {
        const metadata = managementService.getCollectionItems(collection);
        return new OK({ message: 'Lay du lieu thanh cong', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

const getCustomers = async (req, res, next) => {
    try {
        const metadata = await managementService.getCustomers();
        return new OK({ message: 'Lay du lieu khach hang thanh cong', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

const getBranches = async (req, res, next) => {
    try {
        const metadata = await managementService.getBranches();
        return new OK({ message: 'Lay danh sach chi nhanh thanh cong', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

const createBranch = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await managementService.createBranch(req.body);
        return new Created({ message: 'Tạo chi nhánh thành công', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

const updateBranch = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await managementService.updateBranch(req.params.id, req.body);
        return new OK({ message: 'Cập nhật chi nhánh thành công', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

const createCollectionItem = (collection) => (req, res, next) => {
    try {
        const metadata = managementService.createCollectionItem(collection, req.body);
        return new Created({ message: 'Tao du lieu thanh cong', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

const updateCollectionItem = (collection) => (req, res, next) => {
    try {
        const metadata = managementService.updateCollectionItem(collection, req.params.id, req.body);
        return new OK({ message: 'Cap nhat du lieu thanh cong', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

const deleteCollectionItem = (collection) => (req, res, next) => {
    try {
        const metadata = managementService.deleteCollectionItem(collection, req.params.id);
        return new OK({ message: 'Xoa du lieu thanh cong', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

const getDashboardOverview = async (req, res, next) => {
    try {
        const metadata = await managementService.getDashboardOverview();
        return new OK({ message: 'Lay tong quan dashboard thanh cong', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

const getReportsSummary = async (req, res, next) => {
    try {
        const metadata = await managementService.getReportsSummary();
        return new OK({ message: 'Lay du lieu bao cao thanh cong', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

const getVouchers = async (req, res, next) => {
    try {
        const metadata = await managementService.getVouchers();
        return new OK({ message: 'Lay danh sach ma giam gia thanh cong', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

const createVoucher = async (req, res, next) => {
    try {
        const metadata = await managementService.createVoucher(req.body);
        return new Created({ message: 'Tao ma giam gia thanh cong', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

const updateVoucher = async (req, res, next) => {
    try {
        const metadata = await managementService.updateVoucher(req.params.id, req.body);
        return new OK({ message: 'Cap nhat ma giam gia thanh cong', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

const deleteVoucher = async (req, res, next) => {
    try {
        const metadata = await managementService.deleteVoucher(req.params.id);
        return new OK({ message: 'Xoa ma giam gia thanh cong', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

const getStaffs = async (req, res, next) => {
    try {
        const metadata = await managementService.getStaffs();
        return new OK({ message: 'Lấy danh sách nhân viên thành công', metadata }).send(res);
    } catch (error) { next(error); }
};

const createStaff = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await managementService.createStaff(req.body);
        return new Created({ message: 'Tạo tài khoản nhân viên thành công', metadata }).send(res);
    } catch (error) { next(error); }
};

const updateStaff = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await managementService.updateStaff(req.params.id, req.body);
        return new OK({ message: 'Cập nhật nhân viên thành công', metadata }).send(res);
    } catch (error) { next(error); }
};

const deleteStaff = async (req, res, next) => {
    try {
        const metadata = await managementService.deleteStaff(req.params.id);
        return new OK({ message: 'Xóa nhân viên thành công', metadata }).send(res);
    } catch (error) { next(error); }
};

const regenerateStaffCode = async (req, res, next) => {
    try {
        const metadata = await managementService.regenerateStaffCode(req.params.id);
        return new OK({ message: 'Tạo lại mã nhân viên thành công', metadata }).send(res);
    } catch (error) { next(error); }
};

const resetStaffPassword = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await managementService.resetStaffPassword(req.params.id, req.body.newPassword);
        return new OK({ message: 'Đặt lại mật khẩu thành công', metadata }).send(res);
    } catch (error) { next(error); }
};

const restockInventoryItem = (req, res, next) => {
    try {
        const metadata = managementService.restockInventoryItem(req.params.id, Number(req.body.quantity));
        return new OK({ message: 'Nhap them hang thanh cong', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

const updateOrderStatus = (req, res, next) => {
    try {
        const metadata = managementService.updateOrderStatus(req.params.id, req.body.status);
        return new OK({ message: 'Cap nhat trang thai don hang thanh cong', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

const getPosCatalog = (req, res, next) => {
    try {
        const metadata = managementService.getPosCatalog();
        return new OK({ message: 'Lay danh muc POS thanh cong', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

const validatePosVoucher = async (req, res, next) => {
    try {
        const { code, subtotal } = req.body;
        const metadata = await managementService.validatePosVoucher(code, Number(subtotal));
        return new OK({ message: 'Mã giảm giá hợp lệ', metadata }).send(res);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCollection,
    getCustomers,
    getBranches,
    createBranch,
    updateBranch,
    createCollectionItem,
    updateCollectionItem,
    deleteCollectionItem,
    getDashboardOverview,
    getReportsSummary,
    getVouchers,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    restockInventoryItem,
    updateOrderStatus,
    getPosCatalog,
    getStaffs,
    createStaff,
    updateStaff,
    deleteStaff,
    regenerateStaffCode,
    resetStaffPassword,
    validatePosVoucher,
};
