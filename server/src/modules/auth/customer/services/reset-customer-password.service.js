'use strict';

const { authRepository, tokenRepository } = require('../../repositories');
const { hashPassword, verifyResetToken } = require('../../../../core/utils');
const { NotFoundError } = require('../../../../core');
const { roles } = require('../../constants');

const resetCustomerPassword = async (resetToken, newPassword) => {
    const decoded = verifyResetToken(resetToken);
    const user = await authRepository.findByEmail(decoded.email);
    if (!user || user.role !== roles.CUSTOMER) {
        throw new NotFoundError('Không tìm thấy người dùng');
    }

    const hashedPassword = await hashPassword(newPassword);
    await authRepository.updatePassword(decoded.email, hashedPassword);
    await tokenRepository.remove(user.id);
};

module.exports = resetCustomerPassword;
