/**
 * CampusHire - Applications Controller
 */
const db = require('../config/db');
const { evaluateEligibility } = require('./job.controller');

/**
 * Apply for a Job (Student only, with rigorous eligibility checks & duplicate prevention)
 */
async function applyForJob(req, res, next) {
  try {
    const studentId = req.user.student_id;
    const { job_id, notes } = req.body;

    if (!job_id) {
      return res.status(400).json({ success: false, message: 'Job ID is required.' });
    }

    // 1. Fetch Job and Eligibility
    const [jobs] = await db.query(
      `SELECT j.*, e.min_cgpa, e.max_active_backlogs, e.allowed_branches, e.graduation_year 
       FROM job_postings j
       LEFT JOIN eligibility e ON j.job_id = e.job_id
       WHERE j.job_id = ?`,
      [job_id]
    );

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ success: false, message: 'Job drive not found.' });
    }

    const job = jobs[0];

    // Verify job is approved
    if (job.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This job posting is not currently accepting applications.'
      });
    }

    // Verify deadline
    const now = new Date();
    if (new Date(job.deadline) < now) {
      return res.status(400).json({
        success: false,
        message: 'The application deadline for this recruitment drive has passed.'
      });
    }

    // 2. Check for duplicate application
    const [existingApps] = await db.query(
      'SELECT application_id, status FROM applications WHERE job_id = ? AND student_id = ?',
      [job_id, studentId]
    );

    if (existingApps && existingApps.length > 0) {
      return res.status(409).json({
        success: false,
        message: `You have already applied for this role. Current status: ${existingApps[0].status}`
      });
    }

    // 3. Verify student eligibility
    const [students] = await db.query('SELECT * FROM students WHERE student_id = ?', [studentId]);
    if (!students || students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile details not found.' });
    }

    const student = students[0];
    const eligibilityCheck = evaluateEligibility(student, {
      min_cgpa: job.min_cgpa,
      max_active_backlogs: job.max_active_backlogs,
      allowed_branches: job.allowed_branches,
      graduation_year: job.graduation_year
    });

    if (!eligibilityCheck.is_eligible) {
      return res.status(403).json({
        success: false,
        message: 'You do not meet the minimum eligibility criteria for this role.',
        reasons: eligibilityCheck.reasons
      });
    }

    // 4. Insert application record
    const [result] = await db.query(
      'INSERT INTO applications (job_id, student_id, notes) VALUES (?, ?, ?)',
      [job_id, studentId, notes || 'Applied via CampusHire Portal']
    );

    const applicationId = result.insertId;

    // 5. Insert initial status history
    try {
      await db.query(
        'INSERT INTO application_history (application_id, old_status, new_status, remarks) VALUES (?, ?, ?, ?)',
        [applicationId, null, 'Applied', 'Candidate completed application submission']
      );
    } catch (e) {
      // Non-fatal if trigger handles or mock
    }

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully! Track your progress in My Applications.',
      application_id: applicationId
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Application History / Timeline
 */
async function getApplicationHistory(req, res, next) {
  try {
    const applicationId = req.params.applicationId;

    const [history] = await db.query(
      'SELECT * FROM application_history WHERE application_id = ? ORDER BY changed_at ASC',
      [applicationId]
    );

    return res.status(200).json({ success: true, history: history || [] });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  applyForJob,
  getApplicationHistory
};
