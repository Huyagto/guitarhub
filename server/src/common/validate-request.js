'use strict';

const { validationResult } = require('express-validator');
const { UnprocessableEntityError } = require('../core');

const validateRequest = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new UnprocessableEntityError('Dữ liệu không hợp lệ');
        error.errors = errors.array();
        throw error;
    }
};

module.exports = { validateRequest };
