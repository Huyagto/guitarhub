'use strict';

const express = require('express');
const inventoryStaffController = require('../controllers');
const { authenticate, authorize } = require('../../../../core/middlewares');
const { roles } = require('../../../auth/constants');

const router = express.Router();

router.use(authenticate, authorize(roles.STAFF));

router.get('/', inventoryStaffController.getInventory);
router.get('/transactions', inventoryStaffController.getTransactions);
router.post('/:id/receive', inventoryStaffController.receiveInventory);
router.post('/:id/issue', inventoryStaffController.issueInventory);

module.exports = router;
