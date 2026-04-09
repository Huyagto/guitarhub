'use strict';

const { body } = require('express-validator');

module.exports = [
    body('email').isEmail().normalizeEmail().withMessage('Email không hợp lệ'),
];
