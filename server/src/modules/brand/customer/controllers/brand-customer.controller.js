'use strict';

const { OK } = require('../../../../core');
const brandCustomerService = require('../services/brand-customer.service');

const getBrands = async (req, res, next) => {
    try {
        const metadata = await brandCustomerService.getActiveBrands();
        return new OK({ message: 'Lấy thương hiệu thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

module.exports = { getBrands };
