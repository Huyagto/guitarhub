'use strict';

const { changePasswordValidator, refreshTokenValidator } = require('../../shared/validators');

module.exports = {
    loginManagerValidator: require('./login-manager.validator'),
    changeManagerPasswordValidator: changePasswordValidator,
    refreshManagerTokenValidator: refreshTokenValidator,
};
