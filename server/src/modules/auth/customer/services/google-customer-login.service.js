'use strict';

const { google } = require('googleapis');
const { authRepository, tokenRepository } = require('../../repositories');
const { ForbiddenError, BadRequestError } = require('../../../../core');
const { getGoogleOAuth2Client, createTokens, omitPassword } = require('../../shared/utils');
const { roles } = require('../../constants');

const googleCustomerLogin = async (code) => {
    const oauth2Client = getGoogleOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: googleUser } = await oauth2.userinfo.get();

    let user = await authRepository.findByGoogleId(googleUser.id);

    if (!user) {
        user = await authRepository.findByEmail(googleUser.email);
        if (user) {
            if (user.role !== roles.CUSTOMER) {
                throw new BadRequestError('Email này thuộc tài khoản nội bộ, không thể đăng nhập qua cổng customer');
            }
            user = await authRepository.updateGoogleId(user.id, googleUser.id);
        } else {
            user = await authRepository.create({
                email: googleUser.email,
                fullName: googleUser.name,
                googleId: googleUser.id,
                role: roles.CUSTOMER,
            });
        }
    }

    if (user.role !== roles.CUSTOMER) {
        throw new BadRequestError('Tài khoản này không thuộc nhóm customer');
    }

    if (!user.isActive) throw new ForbiddenError('Tài khoản đã bị vô hiệu hóa');

    const appTokens = createTokens(user);
    await tokenRepository.save(user.id, appTokens.refreshToken);
    return { user: omitPassword(user), ...appTokens };
};

module.exports = googleCustomerLogin;
