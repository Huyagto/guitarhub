'use strict';

const { otpRepository } = require('../../repositories');
const { generateResetToken } = require('../../../../core/utils');
const { BadRequestError } = require('../../../../core');

const verifyCustomerOtp = async (email, otp) => {
    const isValid = await otpRepository.verify(email, otp);
    if (!isValid) throw new BadRequestError('Mã OTP không hợp lệ hoặc đã hết hạn');

    await otpRepository.remove(email);
    return { resetToken: generateResetToken({ email }) };
};

module.exports = verifyCustomerOtp;
