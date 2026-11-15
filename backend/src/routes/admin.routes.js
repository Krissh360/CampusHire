/**
 * CampusHire - Admin Routes
 */
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken, roleAuthorize } = require('../middleware/auth');

router.use(authenticateToken);
router.use(roleAuthorize('admin'));

router.get('/analytics', adminController.getDashboardAnalytics);
router.get('/students', adminController.getAllStudents);
router.put('/users/:userId/status', adminController.toggleUserStatus);
router.get('/companies', adminController.getAllCompanies);
router.put('/companies/:companyId/verify', adminController.verifyCompany);
router.put('/jobs/:jobId/status', adminController.updateJobStatus);
router.get('/report', adminController.generatePlacementReport);

module.exports = router;
