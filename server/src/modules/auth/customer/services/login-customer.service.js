'use strict';

const { loginByRole } = require('../../shared/services');
const { roles } = require('../../constants');

const loginCustomer = (payload) =>
    loginByRole({
        ...payload,
        role: roles.CUSTOMER,
        passwordlessMessage: 'Tài khoản này sử dụng đăng nhập Google. Vui lòng đăng nhập bằng Google.',
    });

module.exports = loginCustomer;
