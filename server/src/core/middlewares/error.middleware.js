'use strict';

const { ErrorResponse } = require('../error.response');
const { nodeEnv } = require('../../config');

const errorMiddleware = (err, req, res, next) => {
    if (err instanceof ErrorResponse) {
        return res.status(err.statusCode).json({
            status: 'error',
            code: err.statusCode,
            message: err.message,
            ...(err.errors && { errors: err.errors }),
        });
    }

    console.error(`[${new Date().toISOString()}] Unexpected error:`, err);

    return res.status(500).json({
        status: 'error',
        code: 500,
        message: 'Đã xảy ra lỗi hệ thống, vui lòng thử lại sau',
        ...(nodeEnv === 'development' && { stack: err.stack }),
    });
};

module.exports = errorMiddleware;
