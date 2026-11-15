/**
 * CampusHire - Application Routes
 */
const express = require('express');
const router = express.Router();
const appController = require('../controllers/application.controller');
const { authenticateToken, roleAuthorize } = require('../middleware/auth');

router.post('/apply', authenticateToken, roleAuthorize('student'), appController.applyForJob);
router.get('/:applicationId/history', authenticateToken, appController.getApplicationHistory);

module.exports = router;
