/**
 * CampusHire - Placement Officer / Admin Controller
 */
const db = require('../config/db');

/**
 * Get Comprehensive Campus Analytics & Placement KPIs
 */
async function getDashboardAnalytics(req, res, next) {
  try {
    const store = db.getFallbackStore && db.getFallbackStore();

    // 1. Overall Stats
    const [overallRows] = await db.query(
      `SELECT 
         COUNT(DISTINCT s.student_id) AS total_students,
         SUM(CASE WHEN s.is_placed = 1 THEN 1 ELSE 0 END) AS placed_students,
         ROUND((SUM(CASE WHEN s.is_placed = 1 THEN 1 ELSE 0 END) / COUNT(DISTINCT s.student_id)) * 100, 1) AS placement_rate,
         (SELECT COUNT(*) FROM companies) AS total_companies,
         (SELECT COUNT(*) FROM job_postings WHERE status = 'approved') AS active_jobs,
         (SELECT COUNT(*) FROM applications) AS total_applications,
         ROUND(AVG(o.package_offered), 2) AS avg_package,
         ROUND(MAX(o.package_offered), 2) AS highest_package
       FROM students s
       LEFT JOIN offers o ON s.student_id = o.student_id`
    );

    const stats = overallRows && overallRows[0] ? overallRows[0] : {
      total_students: 6,
      placed_students: 2,
      placement_rate: 33.3,
      total_companies: 3,
      active_jobs: 3,
      total_applications: 8,
      avg_package: 26.25,
      highest_package: 28.50
    };

    // 2. Branch-wise Placement Breakdown
    const [branchRows] = await db.query(
      `SELECT 
         branch,
         COUNT(*) AS total,
         SUM(CASE WHEN is_placed = 1 THEN 1 ELSE 0 END) AS placed,
         ROUND((SUM(CASE WHEN is_placed = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 1) AS rate
       FROM students
       GROUP BY branch`
    );

    const branchStats = branchRows && branchRows.length > 0 ? branchRows : (store ? [
      { branch: 'CSE', total: 3, placed: 2, rate: 66.7 },
      { branch: 'IT', total: 1, placed: 0, rate: 0.0 },
      { branch: 'ECE', total: 1, placed: 0, rate: 0.0 },
      { branch: 'MECH', total: 1, placed: 0, rate: 0.0 }
    ] : []);

    // 3. Top Recruiting Companies
    const [companyRows] = await db.query(
      `SELECT 
         c.company_name,
         COUNT(DISTINCT o.offer_id) AS offers_made,
         ROUND(AVG(o.package_offered), 2) AS avg_package
       FROM companies c
       JOIN job_postings j ON c.company_id = j.company_id
       LEFT JOIN offers o ON j.job_id = o.job_id
       GROUP BY c.company_id, c.company_name
       ORDER BY offers_made DESC, avg_package DESC`
    );

    const topCompanies = companyRows && companyRows.length > 0 ? companyRows : (store ? [
      { company_name: 'Google India', offers_made: 1, avg_package: 28.50 },
      { company_name: 'Microsoft Corporation', offers_made: 1, avg_package: 24.00 },
      { company_name: 'Infosys Technologies', offers_made: 0, avg_package: 0.00 }
    ] : []);

    return res.status(200).json({
      success: true,
      analytics: {
        ...stats,
        branchStats,
        topCompanies
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get All Students with User Status
 */
async function getAllStudents(req, res, next) {
  try {
    const { branch, is_placed, search } = req.query;

    const [students] = await db.query(
      `SELECT 
         s.*,
         u.email,
         u.is_active,
         (SELECT COUNT(*) FROM applications a WHERE a.student_id = s.student_id) AS applications_count,
         (SELECT o.package_offered FROM offers o WHERE o.student_id = s.student_id ORDER BY o.package_offered DESC LIMIT 1) AS highest_offer
       FROM students s
       JOIN users u ON s.user_id = u.user_id
       ORDER BY s.roll_number ASC`
    );

    let list = students || [];

    if (branch) {
      list = list.filter(s => s.branch.toUpperCase() === branch.toUpperCase());
    }
    if (is_placed !== undefined) {
      const placedBool = is_placed === 'true' || is_placed === '1' || is_placed === 1;
      list = list.filter(s => Boolean(s.is_placed) === placedBool);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.first_name.toLowerCase().includes(q) ||
        s.last_name.toLowerCase().includes(q) ||
        s.roll_number.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({ success: true, count: list.length, students: list });
  } catch (err) {
    next(err);
  }
}

/**
 * Toggle User Account Active State (Deactivate / Reactivate)
 */
async function toggleUserStatus(req, res, next) {
  try {
    const userId = req.params.userId;
    const { is_active } = req.body;

    await db.query('UPDATE users SET is_active = ? WHERE user_id = ?', [is_active ? 1 : 0, userId]);

    const store = db.getFallbackStore && db.getFallbackStore();
    if (store) {
      const u = store.users.find(usr => usr.user_id === Number(userId));
      if (u) u.is_active = is_active ? 1 : 0;
    }

    return res.status(200).json({
      success: true,
      message: `User account has been ${is_active ? 'activated' : 'deactivated'}.`
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get All Companies
 */
async function getAllCompanies(req, res, next) {
  try {
    const [companies] = await db.query(
      `SELECT 
         c.*,
         u.email,
         u.is_active,
         (SELECT COUNT(*) FROM job_postings j WHERE j.company_id = c.company_id) AS total_jobs,
         (SELECT COUNT(*) FROM applications a JOIN job_postings j ON a.job_id = j.job_id WHERE j.company_id = c.company_id) AS total_applicants
       FROM companies c
       JOIN users u ON c.user_id = u.user_id
       ORDER BY c.company_name ASC`
    );

    return res.status(200).json({ success: true, count: (companies || []).length, companies: companies || [] });
  } catch (err) {
    next(err);
  }
}

/**
 * Verify or Reject Company
 */
async function verifyCompany(req, res, next) {
  try {
    const companyId = req.params.companyId;
    const { is_verified } = req.body;

    await db.query('UPDATE companies SET is_verified = ? WHERE company_id = ?', [is_verified ? 1 : 0, companyId]);

    const store = db.getFallbackStore && db.getFallbackStore();
    if (store) {
      const c = store.companies.find(comp => comp.company_id === Number(companyId));
      if (c) c.is_verified = is_verified ? 1 : 0;
    }

    return res.status(200).json({
      success: true,
      message: `Company verification status updated to: ${is_verified ? 'Verified' : 'Unverified'}.`
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Moderate Job Posting Status (Approve, Reject, Close)
 */
async function updateJobStatus(req, res, next) {
  try {
    const jobId = req.params.jobId;
    const { status } = req.body;

    const valid = ['draft', 'pending_approval', 'approved', 'rejected', 'closed'];
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${valid.join(', ')}` });
    }

    await db.query('UPDATE job_postings SET status = ? WHERE job_id = ?', [status, jobId]);

    const store = db.getFallbackStore && db.getFallbackStore();
    if (store) {
      const j = store.job_postings.find(job => job.job_id === Number(jobId));
      if (j) j.status = status;
    }

    return res.status(200).json({
      success: true,
      message: `Job posting status updated to '${status}'.`
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Generate Comprehensive Placement Report
 */
async function generatePlacementReport(req, res, next) {
  try {
    const [report] = await db.query(
      `SELECT 
         s.roll_number,
         CONCAT(s.first_name, ' ', s.last_name) AS student_name,
         s.branch,
         s.cgpa,
         s.graduation_year,
         s.is_placed,
         c.company_name,
         j.title AS job_title,
         o.package_offered AS package_lpa,
         o.joining_date,
         o.status AS offer_status
       FROM students s
       LEFT JOIN offers o ON s.student_id = o.student_id
       LEFT JOIN job_postings j ON o.job_id = j.job_id
       LEFT JOIN companies c ON j.company_id = c.company_id
       ORDER BY s.is_placed DESC, o.package_offered DESC, s.roll_number ASC`
    );

    return res.status(200).json({ success: true, count: (report || []).length, report: report || [] });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardAnalytics,
  getAllStudents,
  toggleUserStatus,
  getAllCompanies,
  verifyCompany,
  updateJobStatus,
  generatePlacementReport
};
