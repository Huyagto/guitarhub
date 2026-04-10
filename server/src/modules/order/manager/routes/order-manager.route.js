'use strict';

const express = require('express');
const orderManagerController = require('../controllers/order-manager.controller');
const { updateOrderStatusValidator } = require('../validators/order-manager.validator');
const { authenticate, authorize } = require('../../../../core/middlewares');
const { roles } = require('../../../auth/constants');

const router = express.Router();

router.use(authenticate, authorize(roles.MANAGER));

router.get('/', orderManagerController.getOrders);
router.patch('/:id/status', updateOrderStatusValidator, orderManagerController.updateOrderStatus);

module.exports = router;
