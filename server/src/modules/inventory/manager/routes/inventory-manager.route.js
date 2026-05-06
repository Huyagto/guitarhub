'use strict';

const express = require('express');
const inventoryManagerController = require('../controllers/inventory-manager.controller');
const { restockInventoryValidator } = require('../validators/inventory-manager.validator');
const { authenticate, authorize } = require('../../../../core/middlewares');
const { roles } = require('../../../auth/constants');

const router = express.Router();

router.use(authenticate, authorize(roles.MANAGER));

router.get('/', inventoryManagerController.getInventory);
router.get('/transactions', inventoryManagerController.getInventoryTransactions);
router.post('/:id/restock', restockInventoryValidator, inventoryManagerController.restockInventory);
router.post('/:id/issue', restockInventoryValidator, inventoryManagerController.issueInventory);
router.post('/:id/stocktake', inventoryManagerController.stocktakeInventory);

module.exports = router;
