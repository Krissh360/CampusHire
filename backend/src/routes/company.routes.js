/**
 * CampusHire - Company Routes
 */
const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company.controller');
const { authenticateToken, roleAuthorize } = require('../middleware/auth');

router.use(authenticateToken);
router.use(roleAuthorize('company'));

router.get('/profile', companyController.getProfile);
router.put('/profile', companyController.updateProfile);
router.post('/jobs', companyController.createJob);
router.get('/jobs', companyController.getMyJobs);
router.get('/jobs/:jobId/applicants', companyController.getJobApplicants);
router.put('/applications/:applicationId/status', companyController.updateApplicationStatus);
router.post('/interviews', companyController.scheduleInterview);
router.get('/interviews', companyController.getCompanyInterviews);
router.get('/stats', companyController.getDashboardStats);

module.exports = router;
