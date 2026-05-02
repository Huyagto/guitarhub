'use strict';

const { loginByStaffCode } = require('../../shared/services');

const loginStaff = (payload) => loginByStaffCode(payload);

module.exports = loginStaff;
