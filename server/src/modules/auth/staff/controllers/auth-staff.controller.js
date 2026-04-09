'use strict';

const { OK } = require('../../../../core');
const { validateRequest } = require('../../shared/utils');
const staffAuthService = require('../services');
const staffAuthResponseDto = require('../dto');

const login = async (req, res, next) => {
    try {
        validateRequest(req);
        const result = await staffAuthService.loginStaff(req.body);
        return new OK({
            message: 'Đăng nhập thành công',
            metadata: staffAuthResponseDto.toStaffAuthResponse(result),
        }).send(res);
    } catch (error) { next(error); }
};

const logout = async (req, res, next) => {
    try {
        await staffAuthService.logoutStaff(req.user.id);
        return new OK({ message: 'Đăng xuất thành công' }).send(res);
    } catch (error) { next(error); }
};

const refreshToken = async (req, res, next) => {
    try {
        validateRequest(req);
        const tokens = await staffAuthService.refreshStaffToken(req.body.refreshToken);
        return new OK({
            message: 'Làm mới token thành công',
            metadata: staffAuthResponseDto.toStaffTokenResponse(tokens),
        }).send(res);
    } catch (error) { next(error); }
};

const getProfile = async (req, res, next) => {
    try {
        const user = await staffAuthService.getStaffProfile(req.user.id);
        return new OK({
            message: 'Lấy thông tin tài khoản thành công',
            metadata: staffAuthResponseDto.toStaffProfileResponse(user),
        }).send(res);
    } catch (error) { next(error); }
};

const changePassword = async (req, res, next) => {
    try {
        validateRequest(req);
        await staffAuthService.changeStaffPassword(req.user.id, req.body);
        return new OK({ message: 'Đổi mật khẩu thành công, vui lòng đăng nhập lại' }).send(res);
    } catch (error) { next(error); }
};

module.exports = { login, logout, refreshToken, getProfile, changePassword };
