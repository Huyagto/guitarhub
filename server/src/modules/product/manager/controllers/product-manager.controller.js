'use strict';

const { Created, OK } = require('../../../../core');
const { validateRequest } = require('../../../../common');
const productManagerService = require('../services/product-manager.service');

const getProducts = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await productManagerService.getProducts(req.query);
        return new OK({ message: 'Lấy sản phẩm thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const getProductById = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await productManagerService.getProductById(Number(req.params.id));
        return new OK({ message: 'Lấy chi tiết sản phẩm thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const createProduct = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await productManagerService.createProduct(req.body);
        return new Created({ message: 'Tạo sản phẩm thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await productManagerService.updateProduct(Number(req.params.id), req.body);
        return new OK({ message: 'Cập nhật sản phẩm thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await productManagerService.deleteProduct(Number(req.params.id));
        return new OK({ message: 'Xóa sản phẩm thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const uploadProductImage = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await productManagerService.uploadManagerProductImage(req.body);
        return new OK({ message: 'Tai anh san pham thanh cong', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,
};
