'use strict';

const { google } = require('googleapis');
const {
    generateAccessToken,
    generateRefreshToken,
} = require('../../../../core/utils');
const {
    googleClientId,
    googleClientSecret,
    googleLoginUri,
    customerAppUrl,
} = require('../../../../config');

const omitPassword = (user) => {
    const { password, ...rest } = user;
    return {
        ...rest,
        hasPassword: Boolean(password),
    };
};

const createTokens = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        branchId: user.branchId || null,
    };
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
};

const getGoogleOAuth2Client = () =>
    new google.auth.OAuth2(googleClientId, googleClientSecret, googleLoginUri);

const buildCustomerGoogleCallbackUrl = ({ accessToken, refreshToken, user, error }) => {
    const callbackBaseUrl = `${customerAppUrl.replace(/\/$/, '')}/google/callback`;
    const hashParams = new URLSearchParams();

    if (error) {
        hashParams.set('error', error);
    } else {
        hashParams.set('accessToken', accessToken);
        hashParams.set('refreshToken', refreshToken);
        hashParams.set('user', Buffer.from(JSON.stringify(user), 'utf8').toString('base64url'));
    }

    return `${callbackBaseUrl}#${hashParams.toString()}`;
};

module.exports = {
    omitPassword,
    createTokens,
    getGoogleOAuth2Client,
    buildCustomerGoogleCallbackUrl,
};
