'use strict';

const express = require('express');
const productStaffController = require('../controllers/product-staff.controller');
const {
    getProductsValidator,
    productIdParamValidator,
} = require('../validators/product-staff.validator');
const { authenticate, authorize } = require('../../../../core/middlewares');
const { roles } = require('../../../auth/constants');

const router = express.Router();

router.use(authenticate, authorize(roles.STAFF));

router.get('/', getProductsValidator, productStaffController.getProducts);
router.get('/:id', productIdParamValidator, productStaffController.getProductById);

module.exports = router;
