'use strict';

const express = require('express');
const categoryManagerController = require('../controllers/category-manager.controller');
const {
    getCategoriesValidator,
    createCategoryValidator,
    updateCategoryValidator,
    categoryIdParamValidator,
} = require('../validators/category-manager.validator');
const { authenticate, authorize } = require('../../../../core/middlewares');
const { roles } = require('../../../auth/constants');

const router = express.Router();

router.use(authenticate, authorize(roles.MANAGER));

router.get('/', getCategoriesValidator, categoryManagerController.getCategories);
router.get('/:id', categoryIdParamValidator, categoryManagerController.getCategoryById);
router.post('/', createCategoryValidator, categoryManagerController.createCategory);
router.patch('/:id', updateCategoryValidator, categoryManagerController.updateCategory);
router.delete('/:id', categoryIdParamValidator, categoryManagerController.deleteCategory);

module.exports = router;
