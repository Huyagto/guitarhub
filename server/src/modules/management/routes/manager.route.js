'use strict';

const express = require('express');
const controller = require('../controllers/management.controller');
const { authenticate, authorize } = require('../../../core/middlewares');
const { roles } = require('../../auth/constants');
const { createStaffValidator, updateStaffValidator, resetStaffPasswordValidator } = require('../validators/staff.validator');
const { createBranchValidator, updateBranchValidator } = require('../validators/branch.validator');

const router = express.Router();

router.use(authenticate, authorize(roles.MANAGER));

router.get('/dashboard/overview', controller.getDashboardOverview);

router.get('/customers', controller.getCustomers);
router.get('/branches', controller.getBranches);
router.post('/branches', createBranchValidator, controller.createBranch);
router.patch('/branches/:id', updateBranchValidator, controller.updateBranch);

router.get('/vouchers', controller.getVouchers);
router.post('/vouchers', controller.createVoucher);
router.patch('/vouchers/:id', controller.updateVoucher);
router.delete('/vouchers/:id', controller.deleteVoucher);

router.get('/staffs', controller.getStaffs);
router.post('/staffs', createStaffValidator, controller.createStaff);
router.patch('/staffs/:id', updateStaffValidator, controller.updateStaff);
router.delete('/staffs/:id', controller.deleteStaff);
router.patch('/staffs/:id/reset-password', resetStaffPasswordValidator, controller.resetStaffPassword);
router.patch('/staffs/:id/regenerate-code', controller.regenerateStaffCode);

module.exports = router;
