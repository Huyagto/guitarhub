'use strict';

const { changePasswordValidator, refreshTokenValidator } = require('../../shared/validators');

module.exports = {
    registerCustomerValidator: require('./register-customer.validator'),
    loginCustomerValidator: require('./login-customer.validator'),
    forgotCustomerPasswordValidator: require('./forgot-customer-password.validator'),
    verifyCustomerOtpValidator: require('./verify-customer-otp.validator'),
    resetCustomerPasswordValidator: require('./reset-customer-password.validator'),
    changeCustomerPasswordValidator: changePasswordValidator,
    refreshCustomerTokenValidator: refreshTokenValidator,
};
