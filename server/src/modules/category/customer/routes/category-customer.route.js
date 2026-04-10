'use strict';

const express = require('express');
const categoryCustomerController = require('../controllers/category-customer.controller');

const router = express.Router();

router.get('/', categoryCustomerController.getCategories);

module.exports = router;
