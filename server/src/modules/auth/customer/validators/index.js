'use strict';

const { changePasswordValidator, refreshTokenValidator } = require('../../shared/validators');

module.exports = {
    registerCustomerValidator: require('./register-customer.validator'),
    loginCustomerValidator: require('./login-customer.validator'),
    forgotCustomerPasswordValidator: require('./forgot-customer-password.validator'),
    verifyCustomerOtpValidator: require('./verify-customer-otp.validator'),
    resetCustomerPasswordValidator: require('./reset-customer-password.validator'),
    updateCustomerProfileValidator: require('./update-customer-profile.validator'),
    updateCustomerDefaultShippingAddressValidator: require('./update-customer-default-shipping-address.validator'),
    changeCustomerPasswordValidator: changePasswordValidator,
    refreshCustomerTokenValidator: refreshTokenValidator,
};
