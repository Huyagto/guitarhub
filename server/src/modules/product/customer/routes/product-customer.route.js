'use strict';

const express = require('express');
const productCustomerController = require('../controllers/product-customer.controller');
const {
    getProductsValidator,
    productSlugParamValidator,
} = require('../validators/product-customer.validator');

const router = express.Router();

router.get('/', getProductsValidator, productCustomerController.getProducts);
router.get('/best-sellers', productCustomerController.getBestSellerProducts);
router.get('/new-arrivals', productCustomerController.getNewArrivalProducts);
router.get('/branches/available', productCustomerController.getAvailableBranches);
router.get('/:slug', productSlugParamValidator, productCustomerController.getProductBySlug);
router.get('/:slug/related', productSlugParamValidator, productCustomerController.getRelatedProducts);

module.exports = router;
