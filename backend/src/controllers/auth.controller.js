/**
 * CampusHire - Authentication Controller
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'campushire_jwt_secret_token_secure_academic_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Register Student
 */
async function registerStudent(req, res, next) {
  try {
    const {
      email,
      password,
      roll_number,
      first_name,
      last_name,
      phone,
      branch,
      semester,
      cgpa,
      graduation_year,
      active_backlogs = 0,
      total_backlogs = 0
    } = req.body;

    // Validate inputs
    if (!email || !password || !roll_number || !first_name || !last_name || !branch || !semester || !cgpa || !graduation_year) {
      return res.status(400).json({
        success: false,
        message: 'All mandatory fields (email, password, roll_number, name, branch, semester, cgpa, graduation_year) are required.'
      });
    }

    if (cgpa < 0 || cgpa > 10) {
      return res.status(400).json({ success: false, message: 'CGPA must be between 0.00 and 10.00' });
    }

    // Check duplicate email
    const [existingUsers] = await db.query('SELECT user_id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existingUsers && existingUsers.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const [userResult] = await db.query(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      [email.toLowerCase(), passwordHash, 'student']
    );
    const userId = userResult.insertId;

    // Insert student profile
    const [studentResult] = await db.query(
      `INSERT INTO students 
        (user_id, roll_number, first_name, last_name, phone, branch, semester, cgpa, graduation_year, active_backlogs, total_backlogs) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        roll_number.toUpperCase(),
        first_name,
        last_name,
        phone || null,
        branch.toUpperCase(),
        Number(semester),
        Number(cgpa),
        Number(graduation_year),
        Number(active_backlogs) || 0,
        Number(total_backlogs) || 0
      ]
    );

    const token = jwt.sign({ user_id: userId, role: 'student', email: email.toLowerCase() }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(201).json({
      success: true,
      message: 'Student account registered successfully.',
      token,
      user: {
        user_id: userId,
        student_id: studentResult.insertId,
        email: email.toLowerCase(),
        role: 'student',
        first_name,
        last_name,
        roll_number: roll_number.toUpperCase(),
        branch: branch.toUpperCase(),
        cgpa: Number(cgpa)
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Register Company
 */
async function registerCompany(req, res, next) {
  try {
    const {
      email,
      password,
      company_name,
      industry,
      website,
      description,
      hr_name,
      hr_email,
      hr_phone,
      location
    } = req.body;

    if (!email || !password || !company_name || !hr_name || !hr_email) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, company name, HR name, and HR email are required.'
      });
    }

    // Check duplicate email
    const [existingUsers] = await db.query('SELECT user_id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existingUsers && existingUsers.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const [userResult] = await db.query(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      [email.toLowerCase(), passwordHash, 'company']
    );
    const userId = userResult.insertId;

    // Insert company profile (is_verified defaults to FALSE until admin approves)
    const [compResult] = await db.query(
      `INSERT INTO companies 
        (user_id, company_name, industry, website, description, hr_name, hr_email, hr_phone, location) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        company_name,
        industry || 'Technology',
        website || null,
        description || '',
        hr_name,
        hr_email,
        hr_phone || null,
        location || 'India'
      ]
    );

    const token = jwt.sign({ user_id: userId, role: 'company', email: email.toLowerCase() }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(201).json({
      success: true,
      message: 'Company registered successfully. Pending placement cell verification.',
      token,
      user: {
        user_id: userId,
        company_id: compResult.insertId,
        email: email.toLowerCase(),
        role: 'company',
        company_name,
        is_verified: false
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Universal User Login (Student, Company, Admin)
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account is currently disabled. Please contact the Placement Cell.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    let profile = null;
    if (user.role === 'student') {
      const [students] = await db.query('SELECT * FROM students WHERE user_id = ?', [user.user_id]);
      if (students && students.length > 0) profile = students[0];
    } else if (user.role === 'company') {
      const [companies] = await db.query('SELECT * FROM companies WHERE user_id = ?', [user.user_id]);
      if (companies && companies.length > 0) profile = companies[0];
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${profile ? (profile.first_name || profile.company_name) : 'Placement Officer'}!`,
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        ...(profile || {})
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get current authenticated user profile
 */
async function getMe(req, res, next) {
  try {
    const user = req.user;
    let profile = null;

    if (user.role === 'student') {
      const [students] = await db.query('SELECT * FROM students WHERE user_id = ?', [user.user_id]);
      if (students && students.length > 0) profile = students[0];
    } else if (user.role === 'company') {
      const [companies] = await db.query('SELECT * FROM companies WHERE user_id = ?', [user.user_id]);
      if (companies && companies.length > 0) profile = companies[0];
    }

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        ...(profile || {})
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registerStudent,
  registerCompany,
  login,
  getMe
};
