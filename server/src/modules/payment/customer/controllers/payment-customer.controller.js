'use strict';

const { OK } = require('../../../../core');
const { validateRequest } = require('../../../../common');
const paymentCustomerService = require('../services/payment-customer.service');

const createCheckout = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await paymentCustomerService.createCheckout(req.user.id, req.body, req);
        return new OK({ message: 'Khoi tao thanh toan thanh cong', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

const callbackVnpay = async (req, res, next) => {
    try {
        const redirectUrl = await paymentCustomerService.handleVnpayCallback(req.query);
        return res.redirect(redirectUrl);
    } catch (error) {
        return next(error);
    }
};

const callbackMomo = async (req, res, next) => {
    try {
        const redirectUrl = await paymentCustomerService.handleMomoCallback({
            ...req.query,
            ...req.body,
        });

        if (req.method === 'POST') {
            return res.status(200).json({ resultCode: 0, message: 'success' });
        }

        return res.redirect(redirectUrl);
    } catch (error) {
        return next(error);
    }
};

const callbackZalopay = async (req, res, next) => {
    try {
        const metadata = await paymentCustomerService.handleZalopayCallback(req.body);
        return res.status(200).json(metadata);
    } catch (error) {
        return next(error);
    }
};

const previewCheckout = async (req, res, next) => {
    try {
        const metadata = await paymentCustomerService.previewCheckout(req.user.id, req.body);
        return new OK({ message: 'Xem truoc thanh toan thanh cong', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    createCheckout,
    previewCheckout,
    callbackVnpay,
    callbackMomo,
    callbackZalopay,
};
