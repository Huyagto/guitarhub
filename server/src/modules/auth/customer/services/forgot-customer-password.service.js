'use strict';

const { authRepository, otpRepository } = require('../../repositories');
const { generateOtp, OTP_EXPIRES_MINUTES, sendOtpEmail } = require('../../../../core/utils');
const { NotFoundError } = require('../../../../core');
const { roles } = require('../../constants');

const forgotCustomerPassword = async (email) => {
    const user = await authRepository.findByEmail(email);
    if (!user || user.role !== roles.CUSTOMER) {
        throw new NotFoundError('Email không tồn tại trong hệ thống');
    }

    const otp = generateOtp();
    await otpRepository.save(email, otp);
    await sendOtpEmail(email, otp, OTP_EXPIRES_MINUTES);
};

module.exports = forgotCustomerPassword;
