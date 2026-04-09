'use strict';

const { changePasswordValidator, refreshTokenValidator } = require('../../shared/validators');

module.exports = {
    loginStaffValidator: require('./login-staff.validator'),
    changeStaffPasswordValidator: changePasswordValidator,
    refreshStaffTokenValidator: refreshTokenValidator,
};
