'use strict';

const express = require('express');
const uploadManagerController = require('../controllers');
const { uploadImageValidator } = require('../validators');
const { authenticate, authorize } = require('../../../../core/middlewares');
const { roles } = require('../../../auth/constants');

const router = express.Router();

router.use(authenticate, authorize(roles.MANAGER));

router.post('/image', uploadImageValidator, uploadManagerController.uploadImage);

module.exports = router;
