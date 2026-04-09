'use strict';

module.exports = {
    loginStaff: require('./login-staff.service'),
    logoutStaff: require('./logout-staff.service'),
    refreshStaffToken: require('./refresh-staff-token.service'),
    getStaffProfile: require('./get-staff-profile.service'),
    changeStaffPassword: require('./change-staff-password.service'),
};
