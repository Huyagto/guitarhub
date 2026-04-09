'use strict';

const express = require('express');
const managerAuthController = require('../controllers');
const { authenticate, authorize } = require('../../../../core/middlewares');
const {
    loginManagerValidator,
    changeManagerPasswordValidator,
    refreshManagerTokenValidator,
} = require('../validators');
const { roles } = require('../../constants');

const router = express.Router();

router.post('/login', loginManagerValidator, managerAuthController.login);
router.post('/refresh-token', refreshManagerTokenValidator, managerAuthController.refreshToken);
router.post('/logout', authenticate, authorize(roles.MANAGER), managerAuthController.logout);
router.get('/profile', authenticate, authorize(roles.MANAGER), managerAuthController.getProfile);
router.post('/change-password', authenticate, authorize(roles.MANAGER), changeManagerPasswordValidator, managerAuthController.changePassword);

module.exports = router;
