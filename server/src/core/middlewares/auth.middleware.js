'use strict';

const { verifyAccessToken } = require('../utils');
const { AuthFailureError } = require('../error.response');

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AuthFailureError('Vui lòng đăng nhập để tiếp tục');
        }

        const token = authHeader.split(' ')[1];
        req.user = verifyAccessToken(token);
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') return next(new AuthFailureError('Phiên đăng nhập đã hết hạn'));
        if (error.name === 'JsonWebTokenError') return next(new AuthFailureError('Token không hợp lệ'));
        next(error);
    }
};

module.exports = { authenticate };
