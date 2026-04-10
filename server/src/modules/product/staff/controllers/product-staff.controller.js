'use strict';

const { OK } = require('../../../../core');
const { validateRequest } = require('../../../../common');
const productStaffService = require('../services/product-staff.service');

const getProducts = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await productStaffService.getProducts(req.query);
        return new OK({ message: 'Lấy sản phẩm thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const getProductById = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await productStaffService.getProductById(Number(req.params.id));
        return new OK({ message: 'Lấy chi tiết sản phẩm thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getProducts,
    getProductById,
};
