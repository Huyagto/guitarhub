'use strict';

const { OK } = require('../../../../core');
const { validateRequest } = require('../../../../common');
const categoryStaffService = require('../services/category-staff.service');

const getCategories = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await categoryStaffService.getCategories(req.query);
        return new OK({ message: 'Lấy danh mục thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const getCategoryById = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await categoryStaffService.getCategoryById(Number(req.params.id));
        return new OK({ message: 'Lấy chi tiết danh mục thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getCategories,
    getCategoryById,
};
