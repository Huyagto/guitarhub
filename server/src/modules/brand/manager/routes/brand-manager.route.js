'use strict';

const express = require('express');
const brandManagerController = require('../controllers/brand-manager.controller');
const {
    getBrandsValidator,
    createBrandValidator,
    updateBrandValidator,
    brandIdParamValidator,
} = require('../validators/brand-manager.validator');
const { authenticate, authorize } = require('../../../../core/middlewares');
const { roles } = require('../../../auth/constants');

const router = express.Router();

router.use(authenticate, authorize(roles.MANAGER));

router.get('/', getBrandsValidator, brandManagerController.getBrands);
router.get('/:id', brandIdParamValidator, brandManagerController.getBrandById);
router.post('/', createBrandValidator, brandManagerController.createBrand);
router.patch('/:id', updateBrandValidator, brandManagerController.updateBrand);
router.delete('/:id', brandIdParamValidator, brandManagerController.deleteBrand);

module.exports = router;
