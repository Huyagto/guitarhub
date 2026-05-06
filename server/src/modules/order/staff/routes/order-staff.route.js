'use strict';

const express = require('express');
const orderStaffController = require('../controllers/order-staff.controller');
const { updateOrderStatusValidator } = require('../validators/order-staff.validator');
const { authenticate, authorize } = require('../../../../core/middlewares');
const { roles } = require('../../../auth/constants');

const router = express.Router();

router.use(authenticate, authorize(roles.STAFF));

router.get('/', orderStaffController.getOrders);
router.get('/history', orderStaffController.getOrderHistory);
router.post('/', orderStaffController.createPosOrder);
router.patch('/:id/status', updateOrderStatusValidator, orderStaffController.updateOrderStatus);
router.patch('/:id/cancel', orderStaffController.cancelPosOrder);
router.patch('/:id', orderStaffController.updatePosOrder);

module.exports = router;
