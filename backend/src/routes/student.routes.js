/**
 * CampusHire - Student Routes
 */
const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const studentController = require('../controllers/student.controller');
const { authenticateToken, roleAuthorize } = require('../middleware/auth');

// Setup multer storage for resumes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `resume-${req.user ? req.user.student_id : 'guest'}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF format resumes are allowed.'));
    }
  }
});

// All student routes require student role
router.use(authenticateToken);
router.use(roleAuthorize('student'));

router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);
router.post('/resume', upload.single('resume'), studentController.uploadResume);
router.get('/skills/catalog', studentController.getSkillsCatalog);
router.post('/skills', studentController.addSkill);
router.delete('/skills/:skillId', studentController.removeSkill);
router.get('/applications', studentController.getApplications);
router.get('/interviews', studentController.getInterviews);
router.get('/stats', studentController.getDashboardStats);

module.exports = router;
