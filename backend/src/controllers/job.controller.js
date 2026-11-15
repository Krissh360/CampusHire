/**
 * CampusHire - Job Postings & Eligibility Controller
 */
const db = require('../config/db');

/**
 * Helper: Calculate eligibility of a student for a job
 */
function evaluateEligibility(student, eligibility) {
  if (!student || !eligibility) {
    return { is_eligible: true, reasons: [] };
  }

  const reasons = [];
  const minCgpa = Number(eligibility.min_cgpa || 0);
  const studentCgpa = Number(student.cgpa || 0);

  if (studentCgpa < minCgpa) {
    reasons.push(`Minimum CGPA required is ${minCgpa} (Your CGPA: ${studentCgpa.toFixed(2)})`);
  }

  const maxBacklogs = Number(eligibility.max_active_backlogs || 0);
  const activeBacklogs = Number(student.active_backlogs || 0);
  if (activeBacklogs > maxBacklogs) {
    reasons.push(`Maximum active backlogs allowed is ${maxBacklogs} (You have: ${activeBacklogs})`);
  }

  if (eligibility.graduation_year && Number(student.graduation_year) !== Number(eligibility.graduation_year)) {
    reasons.push(`Eligible graduation batch is ${eligibility.graduation_year} (Your batch: ${student.graduation_year})`);
  }

  if (eligibility.allowed_branches && eligibility.allowed_branches.trim() !== '*') {
    const branches = eligibility.allowed_branches.split(',').map(b => b.trim().toUpperCase());
    const studentBranch = (student.branch || '').trim().toUpperCase();
    if (!branches.includes(studentBranch)) {
      reasons.push(`Eligible branches are [${branches.join(', ')}] (Your branch: ${studentBranch})`);
    }
  }

  return {
    is_eligible: reasons.length === 0,
    reasons
  };
}

/**
 * Get All Job Postings (Public or Student with eligibility calculation)
 */
async function getAllJobs(req, res, next) {
  try {
    const { search, role_type, min_package, location, status } = req.query;

    const [jobs] = await db.query(
      `SELECT 
         j.job_id,
         j.company_id,
         j.title,
         j.description,
         j.role_type,
         j.package_lpa,
         j.location,
         j.deadline,
         j.status,
         j.created_at,
         c.company_name,
         c.industry,
         c.location AS company_location,
         e.min_cgpa,
         e.max_active_backlogs,
         e.allowed_branches,
         e.graduation_year,
         (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.job_id) AS applicant_count
       FROM job_postings j
       JOIN companies c ON j.company_id = c.company_id
       LEFT JOIN eligibility e ON j.job_id = e.job_id
       WHERE 1=1
       ORDER BY j.created_at DESC`
    );

    let jobList = jobs || [];

    // Filter by approved status for students/public (unless admin requesting)
    if (!req.user || req.user.role === 'student') {
      jobList = jobList.filter(j => j.status === 'approved');
    } else if (status) {
      jobList = jobList.filter(j => j.status === status);
    }

    // Keyword search
    if (search) {
      const q = search.toLowerCase();
      jobList = jobList.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company_name.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        (j.description && j.description.toLowerCase().includes(q))
      );
    }

    // Role type filter
    if (role_type) {
      jobList = jobList.filter(j => j.role_type.toLowerCase() === role_type.toLowerCase());
    }

    // Package filter
    if (min_package) {
      jobList = jobList.filter(j => Number(j.package_lpa) >= Number(min_package));
    }

    // Location filter
    if (location) {
      jobList = jobList.filter(j => j.location.toLowerCase().includes(location.toLowerCase()));
    }

    // If student is logged in, attach personalized eligibility check & applied flag
    let studentProfile = null;
    let studentAppliedJobIds = new Set();

    if (req.user && req.user.role === 'student' && req.user.student_id) {
      const [students] = await db.query('SELECT * FROM students WHERE student_id = ?', [req.user.student_id]);
      if (students && students.length > 0) studentProfile = students[0];

      const [applied] = await db.query('SELECT job_id FROM applications WHERE student_id = ?', [req.user.student_id]);
      if (applied) {
        studentAppliedJobIds = new Set(applied.map(a => a.job_id));
      }
    }

    const enrichedJobs = jobList.map(j => {
      const eligibilityData = {
        min_cgpa: j.min_cgpa,
        max_active_backlogs: j.max_active_backlogs,
        allowed_branches: j.allowed_branches,
        graduation_year: j.graduation_year
      };

      const evaluation = studentProfile ? evaluateEligibility(studentProfile, eligibilityData) : null;

      return {
        ...j,
        is_applied: studentAppliedJobIds.has(j.job_id),
        eligibility_check: evaluation
      };
    });

    return res.status(200).json({ success: true, count: enrichedJobs.length, jobs: enrichedJobs });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Job by ID with Full Rounds and Eligibility Criteria
 */
async function getJobById(req, res, next) {
  try {
    const jobId = req.params.jobId;

    const [jobs] = await db.query(
      `SELECT 
         j.*,
         c.company_name,
         c.website,
         c.industry,
         c.description AS company_description,
         c.location AS company_headquarters,
         e.min_cgpa,
         e.max_active_backlogs,
         e.allowed_branches,
         e.graduation_year
       FROM job_postings j
       JOIN companies c ON j.company_id = c.company_id
       LEFT JOIN eligibility e ON j.job_id = e.job_id
       WHERE j.job_id = ?`,
      [jobId]
    );

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    const job = jobs[0];

    // Fetch rounds
    const [rounds] = await db.query(
      'SELECT * FROM recruitment_rounds WHERE job_id = ? ORDER BY round_number ASC',
      [jobId]
    );

    // If student is logged in, check application and eligibility
    let isApplied = false;
    let applicationStatus = null;
    let evaluation = null;

    if (req.user && req.user.role === 'student' && req.user.student_id) {
      const [apps] = await db.query(
        'SELECT application_id, status, applied_at FROM applications WHERE job_id = ? AND student_id = ?',
        [jobId, req.user.student_id]
      );
      if (apps && apps.length > 0) {
        isApplied = true;
        applicationStatus = apps[0].status;
      }

      const [students] = await db.query('SELECT * FROM students WHERE student_id = ?', [req.user.student_id]);
      if (students && students.length > 0) {
        evaluation = evaluateEligibility(students[0], {
          min_cgpa: job.min_cgpa,
          max_active_backlogs: job.max_active_backlogs,
          allowed_branches: job.allowed_branches,
          graduation_year: job.graduation_year
        });
      }
    }

    return res.status(200).json({
      success: true,
      job: {
        ...job,
        rounds: rounds || [],
        is_applied: isApplied,
        application_status: applicationStatus,
        eligibility_check: evaluation
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllJobs,
  getJobById,
  evaluateEligibility
};
