'use strict';

const { loginByRole } = require('../../shared/services');
const { roles } = require('../../constants');

const loginManager = (payload) => loginByRole({ ...payload, role: roles.MANAGER });

module.exports = loginManager;
