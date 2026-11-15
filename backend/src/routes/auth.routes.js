/**
 * CampusHire - Auth Routes
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');

router.post('/register/student', authController.registerStudent);
router.post('/register/company', authController.registerCompany);
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
