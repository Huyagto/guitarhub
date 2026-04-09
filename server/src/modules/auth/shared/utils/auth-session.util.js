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
} = require('../../../../config');

const omitPassword = (user) => {
    const { password: _, ...rest } = user;
    return rest;
};

const createTokens = (user) => {
    const payload = { id: user.id, email: user.email, role: user.role };
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
};

const getGoogleOAuth2Client = () =>
    new google.auth.OAuth2(googleClientId, googleClientSecret, googleLoginUri);

module.exports = {
    omitPassword,
    createTokens,
    getGoogleOAuth2Client,
};
