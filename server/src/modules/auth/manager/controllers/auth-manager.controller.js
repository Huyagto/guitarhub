'use strict';

const { OK } = require('../../../../core');
const { validateRequest } = require('../../shared/utils');
const managerAuthService = require('../services');
const managerAuthResponseDto = require('../dto');

const login = async (req, res, next) => {
    try {
        validateRequest(req);
        const result = await managerAuthService.loginManager(req.body);
        return new OK({
            message: 'Đăng nhập thành công',
            metadata: managerAuthResponseDto.toManagerAuthResponse(result),
        }).send(res);
    } catch (error) { next(error); }
};

const logout = async (req, res, next) => {
    try {
        await managerAuthService.logoutManager(req.user.id);
        return new OK({ message: 'Đăng xuất thành công' }).send(res);
    } catch (error) { next(error); }
};

const refreshToken = async (req, res, next) => {
    try {
        validateRequest(req);
        const tokens = await managerAuthService.refreshManagerToken(req.body.refreshToken);
        return new OK({
            message: 'Làm mới token thành công',
            metadata: managerAuthResponseDto.toManagerTokenResponse(tokens),
        }).send(res);
    } catch (error) { next(error); }
};

const getProfile = async (req, res, next) => {
    try {
        const user = await managerAuthService.getManagerProfile(req.user.id);
        return new OK({
            message: 'Lấy thông tin tài khoản thành công',
            metadata: managerAuthResponseDto.toManagerProfileResponse(user),
        }).send(res);
    } catch (error) { next(error); }
};

const changePassword = async (req, res, next) => {
    try {
        validateRequest(req);
        await managerAuthService.changeManagerPassword(req.user.id, req.body);
        return new OK({ message: 'Đổi mật khẩu thành công, vui lòng đăng nhập lại' }).send(res);
    } catch (error) { next(error); }
};

module.exports = { login, logout, refreshToken, getProfile, changePassword };
