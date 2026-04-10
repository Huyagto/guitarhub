'use strict';

const express = require('express');
const brandCustomerController = require('../controllers/brand-customer.controller');

const router = express.Router();

router.get('/', brandCustomerController.getBrands);

module.exports = router;
