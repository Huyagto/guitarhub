'use strict';

const { authRepository, tokenRepository } = require('../../repositories');
const {
    comparePassword,
    hashPassword,
    verifyRefreshToken,
} = require('../../../../core/utils');
const {
    AuthFailureError,
    NotFoundError,
    ForbiddenError,
    BadRequestError,
} = require('../../../../core');
const { createTokens, omitPassword } = require('../utils');
const { roles } = require('../../constants');

const loginByRole = async ({
    email,
    password,
    role,
    allowPasswordless = false,
    passwordlessMessage,
}) => {
    const user = await authRepository.findByEmail(email);
    if (!user || user.role !== role) throw new AuthFailureError('Email hoặc mật khẩu không đúng');
    if (!user.isActive) throw new ForbiddenError('Tài khoản đã bị vô hiệu hóa');

    if (!user.password) {
        if (!allowPasswordless) {
            throw new BadRequestError(passwordlessMessage || 'Tài khoản này không hỗ trợ đăng nhập bằng mật khẩu');
        }
    } else {
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) throw new AuthFailureError('Email hoặc mật khẩu không đúng');
    }

    const tokens = createTokens(user);
    await tokenRepository.save(user.id, tokens.refreshToken);
    return { user: omitPassword(user), ...tokens };
};

const logoutByUserId = async (userId) => {
    await tokenRepository.remove(userId);
};

const refreshUserSession = async (token) => {
    const decoded = verifyRefreshToken(token);
    const storedToken = await tokenRepository.get(decoded.id);

    if (!storedToken || storedToken !== token) {
        throw new AuthFailureError('Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại');
    }

    const user = await authRepository.findById(decoded.id);
    if (!user || !user.isActive) {
        throw new AuthFailureError('Tài khoản không tồn tại hoặc đã bị vô hiệu hóa');
    }

    const tokens = createTokens(user);
    await tokenRepository.save(user.id, tokens.refreshToken);
    return tokens;
};

const getUserProfileById = async (userId) => {
    const user = await authRepository.findById(userId);
    if (!user) throw new NotFoundError('Không tìm thấy người dùng');
    return omitPassword(user);
};

const updateUserDefaultShippingAddress = async (userId, payload) => {
    const user = await authRepository.findById(userId);
    if (!user) throw new NotFoundError('Không tìm thấy người dùng');

    const updatedUser = await authRepository.updateDefaultShippingAddress(userId, payload);
    return omitPassword(updatedUser);
};

const loginByStaffCode = async ({ staffCode, password }) => {
    const user = await authRepository.findByStaffCode(staffCode);
    if (!user || user.role !== roles.STAFF) throw new AuthFailureError('Mã nhân viên hoặc mật khẩu không đúng');
    if (!user.isActive) throw new ForbiddenError('Tài khoản đã bị vô hiệu hóa');

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) throw new AuthFailureError('Mã nhân viên hoặc mật khẩu không đúng');

    const tokens = createTokens(user);
    await tokenRepository.save(user.id, tokens.refreshToken);
    return { user: omitPassword(user), ...tokens };
};

const updateUserProfile = async (userId, { fullName, phone, avatar }) => {
    const user = await authRepository.findById(userId);
    if (!user) throw new NotFoundError('Không tìm thấy người dùng');

    const data = { fullName };
    if (phone !== undefined) data.phone = phone || null;
    if (avatar !== undefined) data.avatar = avatar || null;

    const updatedUser = await authRepository.updateProfile(userId, data);
    return omitPassword(updatedUser);
};

const changeUserPassword = async (userId, { currentPassword, newPassword }, options = {}) => {
    const { passwordlessMessage } = options;
    const user = await authRepository.findById(userId);
    if (!user) throw new NotFoundError('Không tìm thấy người dùng');

    if (!user.password) {
        throw new BadRequestError(passwordlessMessage || 'Tài khoản này không có mật khẩu để thay đổi');
    }

    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) throw new AuthFailureError('Mật khẩu hiện tại không đúng');

    const hashedPassword = await hashPassword(newPassword);
    await authRepository.updatePassword(user.email, hashedPassword);
    await tokenRepository.remove(userId);
};

module.exports = {
    loginByRole,
    loginByStaffCode,
    logoutByUserId,
    refreshUserSession,
    getUserProfileById,
    updateUserProfile,
    updateUserDefaultShippingAddress,
    changeUserPassword,
};
