'use strict';

const express = require('express');
const reportManagerController = require('../controllers/report-manager.controller');
const { authenticate, authorize } = require('../../../../core/middlewares');
const { roles } = require('../../../auth/constants');

const router = express.Router();

router.use(authenticate, authorize(roles.MANAGER));

router.get('/summary', reportManagerController.getReportSummary);

module.exports = router;
