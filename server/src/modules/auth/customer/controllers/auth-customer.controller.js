'use strict';

const { BadRequestError, Created, OK } = require('../../../../core');
const { validateRequest } = require('../../shared/utils');
const customerAuthService = require('../services');
const customerAuthResponseDto = require('../dto');

const register = async (req, res, next) => {
    try {
        validateRequest(req);
        const user = await customerAuthService.registerCustomer(req.body);
        return new Created({
            message: 'Đăng ký thành công',
            metadata: customerAuthResponseDto.toCustomerProfileResponse(user),
        }).send(res);
    } catch (error) { next(error); }
};

const login = async (req, res, next) => {
    try {
        validateRequest(req);
        const result = await customerAuthService.loginCustomer(req.body);
        return new OK({
            message: 'Đăng nhập thành công',
            metadata: customerAuthResponseDto.toCustomerAuthResponse(result),
        }).send(res);
    } catch (error) { next(error); }
};

const logout = async (req, res, next) => {
    try {
        await customerAuthService.logoutCustomer(req.user.id);
        return new OK({ message: 'Đăng xuất thành công' }).send(res);
    } catch (error) { next(error); }
};

const refreshToken = async (req, res, next) => {
    try {
        validateRequest(req);
        const tokens = await customerAuthService.refreshCustomerToken(req.body.refreshToken);
        return new OK({
            message: 'Làm mới token thành công',
            metadata: customerAuthResponseDto.toCustomerTokenResponse(tokens),
        }).send(res);
    } catch (error) { next(error); }
};

const getProfile = async (req, res, next) => {
    try {
        const user = await customerAuthService.getCustomerProfile(req.user.id);
        return new OK({
            message: 'Lấy thông tin tài khoản thành công',
            metadata: customerAuthResponseDto.toCustomerProfileResponse(user),
        }).send(res);
    } catch (error) { next(error); }
};

const changePassword = async (req, res, next) => {
    try {
        validateRequest(req);
        await customerAuthService.changeCustomerPassword(req.user.id, req.body);
        return new OK({ message: 'Đổi mật khẩu thành công, vui lòng đăng nhập lại' }).send(res);
    } catch (error) { next(error); }
};

const forgotPassword = async (req, res, next) => {
    try {
        validateRequest(req);
        await customerAuthService.forgotCustomerPassword(req.body.email);
        return new OK({ message: 'Mã OTP đã được gửi đến email của bạn' }).send(res);
    } catch (error) { next(error); }
};

const verifyOtp = async (req, res, next) => {
    try {
        validateRequest(req);
        const result = await customerAuthService.verifyCustomerOtp(req.body.email, req.body.otp);
        return new OK({ message: 'Xác thực OTP thành công', metadata: result }).send(res);
    } catch (error) { next(error); }
};

const resetPassword = async (req, res, next) => {
    try {
        validateRequest(req);
        await customerAuthService.resetCustomerPassword(req.body.resetToken, req.body.newPassword);
        return new OK({ message: 'Đặt lại mật khẩu thành công' }).send(res);
    } catch (error) { next(error); }
};

const googleAuthUrl = (_req, res, next) => {
    try {
        const url = customerAuthService.getCustomerGoogleAuthUrl();
        return new OK({ message: 'Lấy đường dẫn đăng nhập Google thành công', metadata: { url } }).send(res);
    } catch (error) { next(error); }
};

const googleCallback = async (req, res, next) => {
    try {
        const { code } = req.query;
        if (!code) throw new BadRequestError('Mã xác thực Google không được để trống');
        const result = await customerAuthService.googleCustomerLogin(code);
        return new OK({
            message: 'Đăng nhập Google thành công',
            metadata: customerAuthResponseDto.toCustomerAuthResponse(result),
        }).send(res);
    } catch (error) { next(error); }
};

module.exports = {
    register,
    login,
    logout,
    refreshToken,
    getProfile,
    changePassword,
    forgotPassword,
    verifyOtp,
    resetPassword,
    googleAuthUrl,
    googleCallback,
};
