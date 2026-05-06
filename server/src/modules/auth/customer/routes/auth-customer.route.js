'use strict';

const express = require('express');
const customerAuthController = require('../controllers');
const { authenticate, authorize } = require('../../../../core/middlewares');
const { roles } = require('../../constants');
const {
    registerCustomerValidator,
    loginCustomerValidator,
    forgotCustomerPasswordValidator,
    verifyCustomerOtpValidator,
    resetCustomerPasswordValidator,
    changeCustomerPasswordValidator,
    refreshCustomerTokenValidator,
    updateCustomerProfileValidator,
    updateCustomerDefaultShippingAddressValidator,
    verifyCustomerRegistrationValidator,
} = require('../validators');

const router = express.Router();

router.post('/register', registerCustomerValidator, customerAuthController.register);
router.post('/register/verify', verifyCustomerRegistrationValidator, customerAuthController.verifyRegistration);
router.post('/login', loginCustomerValidator, customerAuthController.login);
router.post('/forgot-password', forgotCustomerPasswordValidator, customerAuthController.forgotPassword);
router.post('/verify-otp', verifyCustomerOtpValidator, customerAuthController.verifyOtp);
router.post('/reset-password', resetCustomerPasswordValidator, customerAuthController.resetPassword);
router.post('/refresh-token', refreshCustomerTokenValidator, customerAuthController.refreshToken);
router.get('/google', customerAuthController.googleAuthUrl);
router.get('/google/callback', customerAuthController.googleCallback);
router.post('/logout', authenticate, authorize(roles.CUSTOMER), customerAuthController.logout);
router.get('/profile', authenticate, authorize(roles.CUSTOMER), customerAuthController.getProfile);
router.patch('/profile', authenticate, authorize(roles.CUSTOMER), updateCustomerProfileValidator, customerAuthController.updateProfile);
router.patch(
    '/profile/address',
    authenticate,
    authorize(roles.CUSTOMER),
    updateCustomerDefaultShippingAddressValidator,
    customerAuthController.updateDefaultShippingAddress,
);
router.post('/change-password', authenticate, authorize(roles.CUSTOMER), changeCustomerPasswordValidator, customerAuthController.changePassword);

module.exports = router;
