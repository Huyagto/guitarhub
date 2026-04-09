'use strict';

const { changeUserPassword } = require('../../shared/services');

const changeCustomerPassword = (userId, payload) =>
    changeUserPassword(userId, payload, {
        passwordlessMessage: 'Tài khoản này sử dụng đăng nhập Google, không có mật khẩu để thay đổi',
    });

module.exports = changeCustomerPassword;
