/**
 * CampusHire - Job Routes
 */
const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, jobController.getAllJobs);
router.get('/:jobId', optionalAuth, jobController.getJobById);

module.exports = router;
