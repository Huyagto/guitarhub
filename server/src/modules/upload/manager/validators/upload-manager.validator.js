'use strict';

const { body } = require('express-validator');

const uploadImageValidator = [
    body('file').isString().notEmpty().withMessage('Anh tai len khong hop le'),
];

module.exports = {
    uploadImageValidator,
};
