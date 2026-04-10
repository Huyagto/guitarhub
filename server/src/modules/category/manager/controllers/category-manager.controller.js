'use strict';

const { Created, OK } = require('../../../../core');
const { validateRequest } = require('../../../../common');
const categoryManagerService = require('../services/category-manager.service');

const getCategories = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await categoryManagerService.getCategories(req.query);
        return new OK({ message: 'Lấy danh mục thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const getCategoryById = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await categoryManagerService.getCategoryById(Number(req.params.id));
        return new OK({ message: 'Lấy chi tiết danh mục thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const createCategory = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await categoryManagerService.createCategory(req.body);
        return new Created({ message: 'Tạo danh mục thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const updateCategory = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await categoryManagerService.updateCategory(Number(req.params.id), req.body);
        return new OK({ message: 'Cập nhật danh mục thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const deleteCategory = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await categoryManagerService.deleteCategory(Number(req.params.id));
        return new OK({ message: 'Xóa danh mục thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
