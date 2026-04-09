'use strict';

const { AuthFailureError, ForbiddenError } = require('../error.response');

/**
 * Authorize by roles.
 * Usage: authorize('MANAGER'), authorize('MANAGER', 'STAFF')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) return next(new AuthFailureError('Vui lòng đăng nhập để tiếp tục'));
        if (!roles.includes(req.user.role)) return next(new ForbiddenError('Bạn không có quyền thực hiện thao tác này'));
        next();
    };
};

module.exports = { authorize };
