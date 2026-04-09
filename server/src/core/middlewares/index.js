'use strict';

const { authenticate } = require('./auth.middleware');
const errorMiddleware = require('./error.middleware');
const { authorize } = require('./role.middleware');

module.exports = {
    authenticate,
    authorize,
    errorMiddleware,
};
