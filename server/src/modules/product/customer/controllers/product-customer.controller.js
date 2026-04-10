'use strict';

const { OK } = require('../../../../core');
const { validateRequest } = require('../../../../common');
const productCustomerService = require('../services/product-customer.service');

const getProducts = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await productCustomerService.getProducts(req.query);
        return new OK({ message: 'Lấy danh sách sản phẩm thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const getBestSellerProducts = async (req, res, next) => {
    try {
        const metadata = await productCustomerService.getBestSellerProducts();
        return new OK({ message: 'Lấy sản phẩm bán chạy thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const getNewArrivalProducts = async (req, res, next) => {
    try {
        const metadata = await productCustomerService.getNewArrivalProducts();
        return new OK({ message: 'Lấy sản phẩm mới thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const getProductBySlug = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await productCustomerService.getProductBySlug(req.params.slug);
        return new OK({ message: 'Lấy chi tiết sản phẩm thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const getRelatedProducts = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await productCustomerService.getRelatedProducts(req.params.slug);
        return new OK({ message: 'Lấy sản phẩm liên quan thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getProducts,
    getBestSellerProducts,
    getNewArrivalProducts,
    getProductBySlug,
    getRelatedProducts,
};
