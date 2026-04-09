'use strict';

module.exports = {
    loginManager: require('./login-manager.service'),
    logoutManager: require('./logout-manager.service'),
    refreshManagerToken: require('./refresh-manager-token.service'),
    getManagerProfile: require('./get-manager-profile.service'),
    changeManagerPassword: require('./change-manager-password.service'),
};
