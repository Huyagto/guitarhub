'use strict';

const { body } = require('express-validator');

module.exports = [
    body('refreshToken').notEmpty().withMessage('Refresh token không được để trống'),
];
