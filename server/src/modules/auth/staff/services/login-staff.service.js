'use strict';

const { loginByRole } = require('../../shared/services');
const { roles } = require('../../constants');

const loginStaff = (payload) => loginByRole({ ...payload, role: roles.STAFF });

module.exports = loginStaff;
