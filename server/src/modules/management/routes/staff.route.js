'use strict';

const express = require('express');
const controller = require('../controllers/management.controller');
const { authenticate, authorize } = require('../../../core/middlewares');
const { roles } = require('../../auth/constants');

const router = express.Router();

router.use(authenticate, authorize(roles.STAFF));
router.post('/vouchers/validate', controller.validatePosVoucher);
router.get('/shifts', controller.getShiftCloses);
router.post('/shifts/close', controller.closeShift);

module.exports = router;
