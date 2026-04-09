'use strict';

const express = require('express');
const staffAuthController = require('../controllers');
const { authenticate, authorize } = require('../../../../core/middlewares');
const {
    loginStaffValidator,
    changeStaffPasswordValidator,
    refreshStaffTokenValidator,
} = require('../validators');
const { roles } = require('../../constants');

const router = express.Router();

router.post('/login', loginStaffValidator, staffAuthController.login);
router.post('/refresh-token', refreshStaffTokenValidator, staffAuthController.refreshToken);
router.post('/logout', authenticate, authorize(roles.STAFF), staffAuthController.logout);
router.get('/profile', authenticate, authorize(roles.STAFF), staffAuthController.getProfile);
router.post('/change-password', authenticate, authorize(roles.STAFF), changeStaffPasswordValidator, staffAuthController.changePassword);

module.exports = router;
