'use strict';

const { authRepository, otpRepository } = require('../../repositories');
const {
    hashPassword,
    generateOtp,
    OTP_EXPIRES_MINUTES,
    sendOtpEmail,
} = require('../../../../core/utils');
const { ConflictRequestError, BadRequestError } = require('../../../../core');
const { omitPassword } = require('../../shared/utils');
const { roles } = require('../../constants');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const registerCustomer = async ({ email, password, fullName, phone }) => {
    const normalizedEmail = normalizeEmail(email);
    const emailTaken = await authRepository.isEmailTaken(normalizedEmail);
    if (emailTaken) throw new ConflictRequestError('Email đã được sử dụng');

    const otp = generateOtp();
    await otpRepository.savePendingRegistration(normalizedEmail, {
        email: normalizedEmail,
        password,
        fullName,
        phone: phone || null,
    });
    await otpRepository.save(normalizedEmail, otp, 'register');
    await sendOtpEmail(normalizedEmail, otp, OTP_EXPIRES_MINUTES);

    return { email: normalizedEmail, expiresInMinutes: OTP_EXPIRES_MINUTES };
};

const verifyCustomerRegistration = async (email, otp) => {
    const normalizedEmail = normalizeEmail(email);
    const isValid = await otpRepository.verify(normalizedEmail, otp, 'register');
    if (!isValid) throw new BadRequestError('Mã OTP không hợp lệ hoặc đã hết hạn');

    const pending = await otpRepository.getPendingRegistration(normalizedEmail);
    if (!pending) throw new BadRequestError('Thông tin đăng ký đã hết hạn, vui lòng đăng ký lại');

    const emailTaken = await authRepository.isEmailTaken(normalizedEmail);
    if (emailTaken) throw new ConflictRequestError('Email đã được sử dụng');

    const hashedPassword = await hashPassword(pending.password);
    const user = await authRepository.create({
        email: normalizedEmail,
        password: hashedPassword,
        fullName: pending.fullName,
        phone: pending.phone || null,
        role: roles.CUSTOMER,
    });

    await Promise.all([
        otpRepository.remove(normalizedEmail, 'register'),
        otpRepository.removePendingRegistration(normalizedEmail),
    ]);

    return omitPassword(user);
};

registerCustomer.verifyCustomerRegistration = verifyCustomerRegistration;

module.exports = registerCustomer;
