'use strict';

const express = require('express');
const controller = require('../controllers/management.controller');
const { authenticate, authorize } = require('../../../core/middlewares');
const { roles } = require('../../auth/constants');

const router = express.Router();

router.use(authenticate, authorize(roles.MANAGER));

router.get('/dashboard/overview', controller.getDashboardOverview);

router.get('/customers', controller.getCollection('customers'));

router.get('/vouchers', controller.getCollection('vouchers'));
router.post('/vouchers', controller.createCollectionItem('vouchers'));
router.patch('/vouchers/:id', controller.updateCollectionItem('vouchers'));
router.delete('/vouchers/:id', controller.deleteCollectionItem('vouchers'));

module.exports = router;
