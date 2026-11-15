/**
 * CampusHire - Authentication & Role-Based Authorization Middleware
 */
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'campushire_jwt_secret_token_secure_academic_key_2026';

/**
 * Verify JWT token and attach user payload to request
 */
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user from DB to verify user is active and exists
    const [users] = await db.query('SELECT user_id, email, role, is_active FROM users WHERE user_id = ?', [decoded.user_id]);
    
    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session: User no longer exists.'
      });
    }

    const user = users[0];
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact placement cell administrator.'
      });
    }

    // Attach role-specific entity IDs (student_id or company_id)
    if (user.role === 'student') {
      const [students] = await db.query('SELECT student_id, first_name, last_name, roll_number, branch, cgpa FROM students WHERE user_id = ?', [user.user_id]);
      if (students && students.length > 0) {
        user.student_id = students[0].student_id;
        user.first_name = students[0].first_name;
        user.last_name = students[0].last_name;
        user.roll_number = students[0].roll_number;
        user.branch = students[0].branch;
        user.cgpa = students[0].cgpa;
      }
    } else if (user.role === 'company') {
      const [companies] = await db.query('SELECT company_id, company_name, is_verified FROM companies WHERE user_id = ?', [user.user_id]);
      if (companies && companies.length > 0) {
        user.company_id = companies[0].company_id;
        user.company_name = companies[0].company_name;
        user.is_verified = companies[0].is_verified;
      }
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.'
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid or malformed authentication token.'
    });
  }
}

/**
 * Role-Based Access Control Middleware (RBAC)
 * @param {Array<string>} roles - e.g. ['student', 'admin']
 */
function roleAuthorize(roles = []) {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required.'
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${roles.join(', ')}] permissions. Current role: ${req.user.role}`
      });
    }

    next();
  };
}

/**
 * Optional Authentication: Attaches req.user if valid token present, otherwise proceeds as guest
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [users] = await db.query('SELECT user_id, email, role, is_active FROM users WHERE user_id = ?', [decoded.user_id]);
    if (users && users.length > 0 && users[0].is_active) {
      const user = users[0];
      if (user.role === 'student') {
        const [students] = await db.query('SELECT student_id, first_name, last_name, roll_number, branch, cgpa FROM students WHERE user_id = ?', [user.user_id]);
        if (students && students.length > 0) Object.assign(user, students[0]);
      } else if (user.role === 'company') {
        const [companies] = await db.query('SELECT company_id, company_name, is_verified FROM companies WHERE user_id = ?', [user.user_id]);
        if (companies && companies.length > 0) Object.assign(user, companies[0]);
      }
      req.user = user;
    }
  } catch (e) {
    // ignore invalid token for optional auth
  }
  next();
}

module.exports = {
  authenticateToken,
  optionalAuth,
  roleAuthorize
};
