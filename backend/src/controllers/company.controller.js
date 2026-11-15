/**
 * CampusHire - Company / Recruiter Controller
 */
const db = require('../config/db');

/**
 * Get Company Profile
 */
async function getProfile(req, res, next) {
  try {
    const userId = req.user.user_id;

    const [companies] = await db.query(
      `SELECT c.*, u.email 
       FROM companies c 
       JOIN users u ON c.user_id = u.user_id 
       WHERE c.user_id = ?`,
      [userId]
    );

    if (!companies || companies.length === 0) {
      return res.status(404).json({ success: false, message: 'Company profile not found.' });
    }

    return res.status(200).json({ success: true, company: companies[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * Update Company Profile
 */
async function updateProfile(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const { company_name, industry, website, description, hr_name, hr_email, hr_phone, location } = req.body;

    await db.query(
      `UPDATE companies 
       SET company_name = COALESCE(?, company_name),
           industry = COALESCE(?, industry),
           website = COALESCE(?, website),
           description = COALESCE(?, description),
           hr_name = COALESCE(?, hr_name),
           hr_email = COALESCE(?, hr_email),
           hr_phone = COALESCE(?, hr_phone),
           location = COALESCE(?, location)
       WHERE company_id = ?`,
      [company_name, industry, website, description, hr_name, hr_email, hr_phone, location, companyId]
    );

    return res.status(200).json({ success: true, message: 'Company profile updated successfully.' });
  } catch (err) {
    next(err);
  }
}

/**
 * Create Job Posting with Eligibility Criteria & Rounds
 */
async function createJob(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const {
      title,
      description,
      role_type = 'Full-time',
      package_lpa,
      location,
      deadline,
      min_cgpa = 6.00,
      max_active_backlogs = 0,
      allowed_branches = 'CSE,IT,ECE',
      graduation_year = 2026,
      rounds = []
    } = req.body;

    if (!title || !description || !package_lpa || !location || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, package (LPA), location, and deadline are required.'
      });
    }

    // Insert Job Posting (status default: 'pending_approval' or 'approved' depending on workflow)
    const [jobResult] = await db.query(
      `INSERT INTO job_postings 
        (company_id, title, description, role_type, package_lpa, location, deadline, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'approved')`,
      [companyId, title, description, role_type, Number(package_lpa), location, new Date(deadline)]
    );

    const jobId = jobResult.insertId;

    // Insert Eligibility
    await db.query(
      `INSERT INTO eligibility 
        (job_id, min_cgpa, max_active_backlogs, allowed_branches, graduation_year) 
       VALUES (?, ?, ?, ?, ?)`,
      [jobId, Number(min_cgpa), Number(max_active_backlogs), allowed_branches, Number(graduation_year)]
    );

    // Insert Default / Provided Rounds
    const defaultRounds = rounds.length ? rounds : [
      { round_number: 1, round_name: 'Online Assessment', round_type: 'Online Test', description: 'Technical & Aptitude Assessment' },
      { round_number: 2, round_name: 'Technical Interview', round_type: 'Technical', description: 'Core Concepts & Live Coding' },
      { round_number: 3, round_name: 'HR & Cultural Fit Round', round_type: 'HR', description: 'Discussion with HR Director' }
    ];

    for (const r of defaultRounds) {
      await db.query(
        `INSERT INTO recruitment_rounds (job_id, round_number, round_name, round_type, description) 
         VALUES (?, ?, ?, ?, ?)`,
        [jobId, r.round_number, r.round_name, r.round_type || 'Technical', r.description || '']
      );
    }

    // Sync in fallback store if active
    const store = db.getFallbackStore && db.getFallbackStore();
    if (store) {
      const newJobObj = {
        job_id: jobId,
        company_id: companyId,
        title,
        description,
        role_type,
        package_lpa: Number(package_lpa),
        location,
        deadline: new Date(deadline),
        status: 'approved',
        created_at: new Date()
      };
      if (!store.job_postings.some(j => j.job_id === jobId)) store.job_postings.push(newJobObj);

      store.eligibility.push({
        eligibility_id: store.eligibility.length + 1,
        job_id: jobId,
        min_cgpa: Number(min_cgpa),
        max_active_backlogs: Number(max_active_backlogs),
        allowed_branches,
        graduation_year: Number(graduation_year)
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Job recruitment drive published successfully!',
      job_id: jobId
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Company Jobs
 */
async function getMyJobs(req, res, next) {
  try {
    const companyId = req.user.company_id;

    const [jobs] = await db.query(
      `SELECT 
         j.*,
         e.min_cgpa,
         e.max_active_backlogs,
         e.allowed_branches,
         e.graduation_year,
         (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.job_id) AS applicant_count
       FROM job_postings j
       LEFT JOIN eligibility e ON j.job_id = e.job_id
       WHERE j.company_id = ?
       ORDER BY j.created_at DESC`,
      [companyId]
    );

    return res.status(200).json({ success: true, jobs: jobs || [] });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Applicants for a specific job
 */
async function getJobApplicants(req, res, next) {
  try {
    const jobId = req.params.jobId;
    const { status, min_cgpa, branch } = req.query;

    const [applicants] = await db.query(
      `SELECT 
         a.application_id,
         a.job_id,
         a.student_id,
         a.status,
         a.applied_at,
         a.notes,
         s.first_name,
         s.last_name,
         s.roll_number,
         s.branch,
         s.semester,
         s.cgpa,
         s.active_backlogs,
         s.resume_url,
         s.is_placed,
         u.email,
         o.package_offered,
         o.status AS offer_status
       FROM applications a
       JOIN students s ON a.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       LEFT JOIN offers o ON a.application_id = o.application_id
       WHERE a.job_id = ?
       ORDER BY s.cgpa DESC, a.applied_at ASC`,
      [jobId]
    );

    let list = applicants || [];

    if (status) {
      list = list.filter(a => a.status.toLowerCase() === status.toLowerCase());
    }
    if (min_cgpa) {
      list = list.filter(a => Number(a.cgpa) >= Number(min_cgpa));
    }
    if (branch) {
      list = list.filter(a => a.branch.toUpperCase() === branch.toUpperCase());
    }

    return res.status(200).json({ success: true, count: list.length, applicants: list });
  } catch (err) {
    next(err);
  }
}

/**
 * Update Candidate Application Status (Shortlist, Selected, Rejected, etc.)
 */
async function updateApplicationStatus(req, res, next) {
  try {
    const applicationId = req.params.applicationId;
    const { status, remarks, package_offered } = req.body;

    const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Get current application details
    const [currentApps] = await db.query(
      'SELECT a.*, j.package_lpa, j.company_id FROM applications a JOIN job_postings j ON a.job_id = j.job_id WHERE a.application_id = ?',
      [applicationId]
    );

    if (!currentApps || currentApps.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const currentApp = currentApps[0];
    const oldStatus = currentApp.status;

    // Update status
    await db.query('UPDATE applications SET status = ? WHERE application_id = ?', [status, applicationId]);

    // Record audit history
    await db.query(
      'INSERT INTO application_history (application_id, old_status, new_status, remarks) VALUES (?, ?, ?, ?)',
      [applicationId, oldStatus, status, remarks || `Status transitioned to ${status}`]
    );

    // If candidate is Selected, issue offer and mark student as placed
    if (status === 'Selected') {
      const offeredLpa = package_offered ? Number(package_offered) : Number(currentApp.package_lpa);

      await db.query(
        `INSERT INTO offers (application_id, student_id, job_id, package_offered, status) 
         VALUES (?, ?, ?, ?, 'Offered') 
         ON DUPLICATE KEY UPDATE package_offered = ?, status = 'Offered'`,
        [applicationId, currentApp.student_id, currentApp.job_id, offeredLpa, offeredLpa]
      );

      await db.query('UPDATE students SET is_placed = TRUE WHERE student_id = ?', [currentApp.student_id]);
    }

    return res.status(200).json({
      success: true,
      message: `Applicant status updated to '${status}'.`
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Schedule Interview for Candidate
 */
async function scheduleInterview(req, res, next) {
  try {
    const { application_id, round_id, scheduled_time, meeting_link, location, feedback } = req.body;

    if (!application_id || !round_id || !scheduled_time) {
      return res.status(400).json({
        success: false,
        message: 'Application ID, round ID, and scheduled date/time are required.'
      });
    }

    const [result] = await db.query(
      `INSERT INTO interviews 
        (application_id, round_id, scheduled_time, meeting_link, location, feedback, status, result) 
       VALUES (?, ?, ?, ?, ?, ?, 'Scheduled', 'Pending')`,
      [
        application_id,
        round_id,
        new Date(scheduled_time),
        meeting_link || 'https://meet.google.com/new',
        location || 'Virtual Video Call',
        feedback || ''
      ]
    );

    // Update application status to 'Interview Scheduled'
    await db.query("UPDATE applications SET status = 'Interview Scheduled' WHERE application_id = ?", [application_id]);

    await db.query(
      'INSERT INTO application_history (application_id, old_status, new_status, remarks) VALUES (?, ?, ?, ?)',
      [application_id, 'Under Review', 'Interview Scheduled', `Interview scheduled for ${new Date(scheduled_time).toLocaleString()}`]
    );

    return res.status(201).json({
      success: true,
      message: 'Interview slot successfully scheduled.',
      interview_id: result.insertId
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Company Interviews
 */
async function getCompanyInterviews(req, res, next) {
  try {
    const companyId = req.user.company_id;

    const [interviews] = await db.query(
      `SELECT 
         i.*,
         s.first_name,
         s.last_name,
         s.roll_number,
         s.branch,
         s.cgpa,
         j.title AS job_title,
         r.round_name,
         r.round_type
       FROM interviews i
       JOIN applications a ON i.application_id = a.application_id
       JOIN students s ON a.student_id = s.student_id
       JOIN job_postings j ON a.job_id = j.job_id
       JOIN recruitment_rounds r ON i.round_id = r.round_id
       WHERE j.company_id = ?
       ORDER BY i.scheduled_time ASC`,
      [companyId]
    );

    return res.status(200).json({ success: true, interviews: interviews || [] });
  } catch (err) {
    next(err);
  }
}

/**
 * Company Dashboard Summary Statistics
 */
async function getDashboardStats(req, res, next) {
  try {
    const companyId = req.user.company_id;

    const [jobs] = await db.query('SELECT job_id, status FROM job_postings WHERE company_id = ?', [companyId]);
    const jobList = jobs || [];
    const jobIds = jobList.map(j => j.job_id);

    let totalApplicants = 0;
    let shortlisted = 0;
    let interviewsScheduled = 0;
    let selected = 0;

    if (jobIds.length > 0) {
      const [apps] = await db.query('SELECT status FROM applications WHERE job_id IN (?)', [jobIds]);
      const appList = apps || [];
      totalApplicants = appList.length;
      shortlisted = appList.filter(a => a.status === 'Shortlisted').length;
      interviewsScheduled = appList.filter(a => a.status === 'Interview Scheduled').length;
      selected = appList.filter(a => a.status === 'Selected').length;
    }

    return res.status(200).json({
      success: true,
      stats: {
        activeDrives: jobList.filter(j => j.status === 'approved').length,
        totalDrives: jobList.length,
        totalApplicants,
        shortlisted,
        interviewsScheduled,
        selected
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  createJob,
  getMyJobs,
  getJobApplicants,
  updateApplicationStatus,
  scheduleInterview,
  getCompanyInterviews,
  getDashboardStats
};
