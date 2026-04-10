'use strict';

const express = require('express');
const categoryStaffController = require('../controllers/category-staff.controller');
const {
    getCategoriesValidator,
    categoryIdParamValidator,
} = require('../validators/category-staff.validator');
const { authenticate, authorize } = require('../../../../core/middlewares');
const { roles } = require('../../../auth/constants');

const router = express.Router();

router.use(authenticate, authorize(roles.STAFF));

router.get('/', getCategoriesValidator, categoryStaffController.getCategories);
router.get('/:id', categoryIdParamValidator, categoryStaffController.getCategoryById);

module.exports = router;
