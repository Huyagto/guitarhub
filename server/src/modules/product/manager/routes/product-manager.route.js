'use strict';

const express = require('express');
const productManagerController = require('../controllers/product-manager.controller');
const {
    getProductsValidator,
    createProductValidator,
    updateProductValidator,
    productIdParamValidator,
} = require('../validators/product-manager.validator');
const { authenticate, authorize } = require('../../../../core/middlewares');
const { roles } = require('../../../auth/constants');

const router = express.Router();

router.use(authenticate, authorize(roles.MANAGER));

router.get('/', getProductsValidator, productManagerController.getProducts);
router.get('/:id', productIdParamValidator, productManagerController.getProductById);
router.post('/', createProductValidator, productManagerController.createProduct);
router.patch('/:id', updateProductValidator, productManagerController.updateProduct);
router.delete('/:id', productIdParamValidator, productManagerController.deleteProduct);

module.exports = router;
