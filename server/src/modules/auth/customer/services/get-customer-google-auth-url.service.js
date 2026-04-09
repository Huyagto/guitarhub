'use strict';

const { getGoogleOAuth2Client } = require('../../shared/utils');

const getCustomerGoogleAuthUrl = () =>
    getGoogleOAuth2Client().generateAuthUrl({
        access_type: 'offline',
        scope: ['email', 'profile'],
        prompt: 'select_account',
    });

module.exports = getCustomerGoogleAuthUrl;
