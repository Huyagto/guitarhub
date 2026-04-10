'use strict';

const express = require('express');
const cartCustomerController = require('../controllers/cart-customer.controller');
const {
    addCartItemValidator,
    updateCartItemValidator,
    cartItemIdParamValidator,
} = require('../validators/cart-customer.validator');
const { authenticate, authorize } = require('../../../../core/middlewares');
const { roles } = require('../../../auth/constants');

const router = express.Router();

router.use(authenticate, authorize(roles.CUSTOMER));

router.get('/', cartCustomerController.getCart);
router.post('/items', addCartItemValidator, cartCustomerController.addItem);
router.patch('/items/:itemId', updateCartItemValidator, cartCustomerController.updateItem);
router.delete('/items/:itemId', cartItemIdParamValidator, cartCustomerController.removeItem);
router.delete('/', cartCustomerController.clearCart);

module.exports = router;
