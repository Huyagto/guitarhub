'use strict';

const { BadRequestError, Created, OK } = require('../../../../core');
const { validateRequest, buildCustomerGoogleCallbackUrl } = require('../../shared/utils');
const customerAuthService = require('../services');
const customerAuthResponseDto = require('../dto');

const register = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await customerAuthService.registerCustomer(req.body);
        return new Created({
            message: 'Ma OTP da duoc gui den email cua ban',
            metadata,
        }).send(res);
    } catch (error) { next(error); }
};

const verifyRegistration = async (req, res, next) => {
    try {
        validateRequest(req);
        const user = await customerAuthService.verifyCustomerRegistration(req.body.email, req.body.otp);
        return new Created({
            message: 'Dang ky thanh cong',
            metadata: customerAuthResponseDto.toCustomerProfileResponse(user),
        }).send(res);
    } catch (error) { next(error); }
};

const login = async (req, res, next) => {
    try {
        validateRequest(req);
        const result = await customerAuthService.loginCustomer(req.body);
        return new OK({
            message: 'Dang nhap thanh cong',
            metadata: customerAuthResponseDto.toCustomerAuthResponse(result),
        }).send(res);
    } catch (error) { next(error); }
};

const logout = async (req, res, next) => {
    try {
        await customerAuthService.logoutCustomer(req.user.id);
        return new OK({ message: 'Dang xuat thanh cong' }).send(res);
    } catch (error) { next(error); }
};

const refreshToken = async (req, res, next) => {
    try {
        validateRequest(req);
        const tokens = await customerAuthService.refreshCustomerToken(req.body.refreshToken);
        return new OK({
            message: 'Lam moi token thanh cong',
            metadata: customerAuthResponseDto.toCustomerTokenResponse(tokens),
        }).send(res);
    } catch (error) { next(error); }
};

const getProfile = async (req, res, next) => {
    try {
        const user = await customerAuthService.getCustomerProfile(req.user.id);
        return new OK({
            message: 'Lay thong tin tai khoan thanh cong',
            metadata: customerAuthResponseDto.toCustomerProfileResponse(user),
        }).send(res);
    } catch (error) { next(error); }
};

const updateProfile = async (req, res, next) => {
    try {
        validateRequest(req);
        const user = await customerAuthService.updateCustomerProfile(req.user.id, req.body);
        return new OK({
            message: 'Cập nhật hồ sơ thành công',
            metadata: customerAuthResponseDto.toCustomerProfileResponse(user),
        }).send(res);
    } catch (error) { next(error); }
};

const updateDefaultShippingAddress = async (req, res, next) => {
    try {
        validateRequest(req);
        const user = await customerAuthService.updateCustomerDefaultShippingAddress(req.user.id, req.body);
        return new OK({
            message: 'Cap nhat dia chi giao hang mac dinh thanh cong',
            metadata: customerAuthResponseDto.toCustomerProfileResponse(user),
        }).send(res);
    } catch (error) { next(error); }
};

const changePassword = async (req, res, next) => {
    try {
        validateRequest(req);
        await customerAuthService.changeCustomerPassword(req.user.id, req.body);
        return new OK({ message: 'Doi mat khau thanh cong, vui long dang nhap lai' }).send(res);
    } catch (error) { next(error); }
};

const forgotPassword = async (req, res, next) => {
    try {
        validateRequest(req);
        await customerAuthService.forgotCustomerPassword(req.body.email);
        return new OK({ message: 'Ma OTP da duoc gui den email cua ban' }).send(res);
    } catch (error) { next(error); }
};

const verifyOtp = async (req, res, next) => {
    try {
        validateRequest(req);
        const result = await customerAuthService.verifyCustomerOtp(req.body.email, req.body.otp);
        return new OK({ message: 'Xac thuc OTP thanh cong', metadata: result }).send(res);
    } catch (error) { next(error); }
};

const resetPassword = async (req, res, next) => {
    try {
        validateRequest(req);
        await customerAuthService.resetCustomerPassword(req.body.resetToken, req.body.newPassword);
        return new OK({ message: 'Dat lai mat khau thanh cong' }).send(res);
    } catch (error) { next(error); }
};

const googleAuthUrl = (_req, res, next) => {
    try {
        const url = customerAuthService.getCustomerGoogleAuthUrl();
        return new OK({ message: 'Lay duong dan dang nhap Google thanh cong', metadata: { url } }).send(res);
    } catch (error) { next(error); }
};

const googleCallback = async (req, res, next) => {
    try {
        const { code } = req.query;
        if (!code) throw new BadRequestError('Ma xac thuc Google khong duoc de trong');

        const result = await customerAuthService.googleCustomerLogin(code);
        const authPayload = customerAuthResponseDto.toCustomerAuthResponse(result);

        return res.redirect(buildCustomerGoogleCallbackUrl({
            accessToken: authPayload.accessToken,
            refreshToken: authPayload.refreshToken,
            user: authPayload.user,
        }));
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Dang nhap Google that bai';
        return res.redirect(buildCustomerGoogleCallbackUrl({ error: message }));
    }
};

module.exports = {
    register,
    verifyRegistration,
    login,
    logout,
    refreshToken,
    getProfile,
    updateProfile,
    updateDefaultShippingAddress,
    changePassword,
    forgotPassword,
    verifyOtp,
    resetPassword,
    googleAuthUrl,
    googleCallback,
};
