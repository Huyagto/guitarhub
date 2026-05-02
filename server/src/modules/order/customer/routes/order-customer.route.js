'use strict';

const express = require('express');
const orderCustomerController = require('../controllers');
const { authenticate, authorize } = require('../../../../core/middlewares');
const { roles } = require('../../../auth/constants');

const router = express.Router();

router.use(authenticate, authorize(roles.CUSTOMER));

router.get('/', orderCustomerController.getOrders);

module.exports = router;
