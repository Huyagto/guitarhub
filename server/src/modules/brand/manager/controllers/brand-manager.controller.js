'use strict';

const { Created, OK } = require('../../../../core');
const { validateRequest } = require('../../../../common');
const brandManagerService = require('../services/brand-manager.service');

const getBrands = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await brandManagerService.getBrands(req.query);
        return new OK({ message: 'Lấy thương hiệu thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const getBrandById = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await brandManagerService.getBrandById(Number(req.params.id));
        return new OK({ message: 'Lấy chi tiết thương hiệu thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const createBrand = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await brandManagerService.createBrand(req.body);
        return new Created({ message: 'Tạo thương hiệu thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const updateBrand = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await brandManagerService.updateBrand(Number(req.params.id), req.body);
        return new OK({ message: 'Cập nhật thương hiệu thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const deleteBrand = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await brandManagerService.deleteBrand(Number(req.params.id));
        return new OK({ message: 'Xóa thương hiệu thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand,
};
