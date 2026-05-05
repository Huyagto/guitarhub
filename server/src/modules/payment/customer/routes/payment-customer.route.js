'use strict';

const express = require('express');
const paymentCustomerController = require('../controllers/payment-customer.controller');
const { createCheckoutValidator } = require('../validators/payment-customer.validator');
const { authenticate, authorize } = require('../../../../core/middlewares');
const { roles } = require('../../../auth/constants');

const router = express.Router();

router.post('/checkout', authenticate, authorize(roles.CUSTOMER), createCheckoutValidator, paymentCustomerController.createCheckout);
router.post('/checkout/preview', authenticate, authorize(roles.CUSTOMER), paymentCustomerController.previewCheckout);
router.get('/callback/vnpay', paymentCustomerController.callbackVnpay);
router.get('/callback/momo', paymentCustomerController.callbackMomo);
router.post('/callback/momo', paymentCustomerController.callbackMomo);
router.post('/callback/zalopay', paymentCustomerController.callbackZalopay);

module.exports = router;
