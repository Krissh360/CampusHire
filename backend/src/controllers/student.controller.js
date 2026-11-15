/**
 * CampusHire - Student Controller
 */
const db = require('../config/db');

/**
 * Get Student Profile & Associated Skills
 */
async function getProfile(req, res, next) {
  try {
    const userId = req.user.user_id;

    const [students] = await db.query(
      `SELECT s.*, u.email 
       FROM students s 
       JOIN users u ON s.user_id = u.user_id 
       WHERE s.user_id = ?`,
      [userId]
    );

    if (!students || students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const student = students[0];

    // Fetch skills
    const [skills] = await db.query(
      `SELECT ss.skill_id, sk.skill_name, sk.category, ss.proficiency 
       FROM student_skills ss 
       JOIN skills sk ON ss.skill_id = sk.skill_id 
       WHERE ss.student_id = ?`,
      [student.student_id]
    );

    return res.status(200).json({
      success: true,
      student: {
        ...student,
        skills: skills || []
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update Student Academic Profile
 */
async function updateProfile(req, res, next) {
  try {
    const studentId = req.user.student_id;
    const { phone, branch, semester, cgpa, graduation_year, active_backlogs, total_backlogs } = req.body;

    if (cgpa !== undefined && (cgpa < 0 || cgpa > 10)) {
      return res.status(400).json({ success: false, message: 'CGPA must be between 0.00 and 10.00' });
    }

    await db.query(
      `UPDATE students 
       SET phone = COALESCE(?, phone),
           branch = COALESCE(?, branch),
           semester = COALESCE(?, semester),
           cgpa = COALESCE(?, cgpa),
           graduation_year = COALESCE(?, graduation_year),
           active_backlogs = COALESCE(?, active_backlogs),
           total_backlogs = COALESCE(?, total_backlogs)
       WHERE student_id = ?`,
      [phone, branch, semester, cgpa, graduation_year, active_backlogs, total_backlogs, studentId]
    );

    return res.status(200).json({
      success: true,
      message: 'Student profile updated successfully.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Upload Student Resume
 */
async function uploadResume(req, res, next) {
  try {
    const studentId = req.user.student_id;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded. Please upload a PDF file.' });
    }

    const resumeUrl = `/uploads/${req.file.filename}`;

    const store = db.getFallbackStore && db.getFallbackStore();
    if (store) {
      const s = store.students.find(st => st.student_id === studentId);
      if (s) s.resume_url = resumeUrl;
    }

    await db.query('UPDATE students SET resume_url = ? WHERE student_id = ?', [resumeUrl, studentId]);

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully.',
      resume_url: resumeUrl
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Master Skills Catalog
 */
async function getSkillsCatalog(req, res, next) {
  try {
    const [skills] = await db.query('SELECT * FROM skills ORDER BY category, skill_name');
    return res.status(200).json({ success: true, skills: skills || [] });
  } catch (err) {
    next(err);
  }
}

/**
 * Add or Update Skill for Student
 */
async function addSkill(req, res, next) {
  try {
    const studentId = req.user.student_id;
    const { skill_id, proficiency = 'Intermediate' } = req.body;

    if (!skill_id) {
      return res.status(400).json({ success: false, message: 'Skill ID is required.' });
    }

    const store = db.getFallbackStore && db.getFallbackStore();
    if (store) {
      const idx = store.student_skills.findIndex(ss => ss.student_id === studentId && ss.skill_id === Number(skill_id));
      if (idx >= 0) {
        store.student_skills[idx].proficiency = proficiency;
      } else {
        store.student_skills.push({ student_id: studentId, skill_id: Number(skill_id), proficiency });
      }
    }

    await db.query(
      `INSERT INTO student_skills (student_id, skill_id, proficiency) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE proficiency = ?`,
      [studentId, skill_id, proficiency, proficiency]
    );

    return res.status(200).json({ success: true, message: 'Skill saved successfully.' });
  } catch (err) {
    next(err);
  }
}

/**
 * Remove Skill from Student
 */
async function removeSkill(req, res, next) {
  try {
    const studentId = req.user.student_id;
    const skillId = req.params.skillId;

    const store = db.getFallbackStore && db.getFallbackStore();
    if (store) {
      store.student_skills = store.student_skills.filter(ss => !(ss.student_id === studentId && ss.skill_id === Number(skillId)));
    }

    await db.query('DELETE FROM student_skills WHERE student_id = ? AND skill_id = ?', [studentId, skillId]);

    return res.status(200).json({ success: true, message: 'Skill removed successfully.' });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Student Applications with Pipeline Status
 */
async function getApplications(req, res, next) {
  try {
    const studentId = req.user.student_id;

    const [applications] = await db.query(
      `SELECT 
         a.application_id,
         a.job_id,
         a.student_id,
         a.status,
         a.applied_at,
         a.notes,
         j.title,
         j.package_lpa,
         j.role_type,
         j.location,
         c.company_name,
         o.package_offered,
         o.status AS offer_status
       FROM applications a
       JOIN job_postings j ON a.job_id = j.job_id
       JOIN companies c ON j.company_id = c.company_id
       LEFT JOIN offers o ON a.application_id = o.application_id
       WHERE a.student_id = ?
       ORDER BY a.applied_at DESC`,
      [studentId]
    );

    return res.status(200).json({ success: true, applications: applications || [] });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Student Interviews
 */
async function getInterviews(req, res, next) {
  try {
    const studentId = req.user.student_id;

    const [interviews] = await db.query(
      `SELECT 
         i.interview_id,
         i.application_id,
         i.round_id,
         i.scheduled_time,
         i.meeting_link,
         i.location,
         i.feedback,
         i.status,
         i.result,
         j.title AS job_title,
         c.company_name,
         r.round_name,
         r.round_type
       FROM interviews i
       JOIN applications a ON i.application_id = a.application_id
       JOIN job_postings j ON a.job_id = j.job_id
       JOIN companies c ON j.company_id = c.company_id
       JOIN recruitment_rounds r ON i.round_id = r.round_id
       WHERE a.student_id = ?
       ORDER BY i.scheduled_time ASC`,
      [studentId]
    );

    return res.status(200).json({ success: true, interviews: interviews || [] });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Student Dashboard Summary Stats
 */
async function getDashboardStats(req, res, next) {
  try {
    const studentId = req.user.student_id;

    const [apps] = await db.query('SELECT status FROM applications WHERE student_id = ?', [studentId]);
    const applications = apps || [];

    const totalApplied = applications.length;
    const shortlisted = applications.filter(a => a.status === 'Shortlisted').length;
    const interviewScheduled = applications.filter(a => a.status === 'Interview Scheduled').length;
    const selectedOffers = applications.filter(a => a.status === 'Selected').length;

    return res.status(200).json({
      success: true,
      stats: {
        totalApplied,
        shortlisted,
        interviewScheduled,
        selectedOffers
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  uploadResume,
  getSkillsCatalog,
  addSkill,
  removeSkill,
  getApplications,
  getInterviews,
  getDashboardStats
};
