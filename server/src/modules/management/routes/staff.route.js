'use strict';

const express = require('express');
const controller = require('../controllers/management.controller');
const { authenticate, authorize } = require('../../../core/middlewares');
const { roles } = require('../../auth/constants');

const router = express.Router();

router.use(authenticate, authorize(roles.STAFF));
router.get('/catalog', controller.getPosCatalog);
router.post('/vouchers/validate', controller.validatePosVoucher);

module.exports = router;
