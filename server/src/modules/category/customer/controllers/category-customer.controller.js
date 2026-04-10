'use strict';

const { OK } = require('../../../../core');
const categoryCustomerService = require('../services/category-customer.service');

const getCategories = async (req, res, next) => {
    try {
        const metadata = await categoryCustomerService.getActiveCategories();
        return new OK({ message: 'Lấy danh mục thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

module.exports = { getCategories };
