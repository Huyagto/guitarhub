'use strict';

const registerCustomer = require('./register-customer.service');

module.exports = {
    registerCustomer,
    verifyCustomerRegistration: registerCustomer.verifyCustomerRegistration,
    loginCustomer: require('./login-customer.service'),
    logoutCustomer: require('./logout-customer.service'),
    refreshCustomerToken: require('./refresh-customer-token.service'),
    getCustomerProfile: require('./get-customer-profile.service'),
    updateCustomerProfile: require('./update-customer-profile.service'),
    updateCustomerDefaultShippingAddress: require('./update-customer-default-shipping-address.service'),
    changeCustomerPassword: require('./change-customer-password.service'),
    forgotCustomerPassword: require('./forgot-customer-password.service'),
    verifyCustomerOtp: require('./verify-customer-otp.service'),
    resetCustomerPassword: require('./reset-customer-password.service'),
    getCustomerGoogleAuthUrl: require('./get-customer-google-auth-url.service'),
    googleCustomerLogin: require('./google-customer-login.service'),
};
