'use strict';

const { validationResult } = require('express-validator');
const { UnprocessableEntityError } = require('../../../../core');

const validateRequest = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new UnprocessableEntityError('Dữ liệu không hợp lệ');
        err.errors = errors.array();
        throw err;
    }
};

module.exports = { validateRequest };
