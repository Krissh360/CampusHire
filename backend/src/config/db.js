/**
 * CampusHire - Database Connection Layer (mysql2/promise)
 * Supports live MySQL connection pool with automated fallback adapter
 */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'campushire_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
};

let pool = null;
let isConnected = false;
let fallbackMode = false;

// In-Memory Seed Storage for fallback mode
const fallbackStore = {
  users: [
    { user_id: 1, email: 'admin@campushire.edu', password_hash: '$2a$10$x32/kxqAyyFuqH4yQaeIG.dJTmv/MmAzR3ataQrqnTNjZDbNohzEW', role: 'admin', is_active: 1, created_at: new Date('2026-09-01') },
    { user_id: 2, email: 'recruiter@google.com', password_hash: '$2a$10$x32/kxqAyyFuqH4yQaeIG.dJTmv/MmAzR3ataQrqnTNjZDbNohzEW', role: 'company', is_active: 1, created_at: new Date('2026-09-05') },
    { user_id: 3, email: 'recruiter@microsoft.com', password_hash: '$2a$10$x32/kxqAyyFuqH4yQaeIG.dJTmv/MmAzR3ataQrqnTNjZDbNohzEW', role: 'company', is_active: 1, created_at: new Date('2026-09-06') },
    { user_id: 4, email: 'careers@infosys.com', password_hash: '$2a$10$x32/kxqAyyFuqH4yQaeIG.dJTmv/MmAzR3ataQrqnTNjZDbNohzEW', role: 'company', is_active: 1, created_at: new Date('2026-09-07') },
    { user_id: 5, email: 'aarav.sharma@college.edu', password_hash: '$2a$10$x32/kxqAyyFuqH4yQaeIG.dJTmv/MmAzR3ataQrqnTNjZDbNohzEW', role: 'student', is_active: 1, created_at: new Date('2026-09-10') },
    { user_id: 6, email: 'priya.patel@college.edu', password_hash: '$2a$10$x32/kxqAyyFuqH4yQaeIG.dJTmv/MmAzR3ataQrqnTNjZDbNohzEW', role: 'student', is_active: 1, created_at: new Date('2026-09-10') },
    { user_id: 7, email: 'rohit.verma@college.edu', password_hash: '$2a$10$x32/kxqAyyFuqH4yQaeIG.dJTmv/MmAzR3ataQrqnTNjZDbNohzEW', role: 'student', is_active: 1, created_at: new Date('2026-09-11') },
    { user_id: 8, email: 'ananya.iyer@college.edu', password_hash: '$2a$10$x32/kxqAyyFuqH4yQaeIG.dJTmv/MmAzR3ataQrqnTNjZDbNohzEW', role: 'student', is_active: 1, created_at: new Date('2026-09-12') },
    { user_id: 9, email: 'vikram.singh@college.edu', password_hash: '$2a$10$x32/kxqAyyFuqH4yQaeIG.dJTmv/MmAzR3ataQrqnTNjZDbNohzEW', role: 'student', is_active: 1, created_at: new Date('2026-09-12') },
    { user_id: 10, email: 'sneha.reddy@college.edu', password_hash: '$2a$10$x32/kxqAyyFuqH4yQaeIG.dJTmv/MmAzR3ataQrqnTNjZDbNohzEW', role: 'student', is_active: 1, created_at: new Date('2026-09-13') }
  ],
  students: [
    { student_id: 1, user_id: 5, roll_number: '2023CS0101', first_name: 'Aarav', last_name: 'Sharma', phone: '+91 9123456780', branch: 'CSE', semester: 8, cgpa: 9.40, graduation_year: 2026, active_backlogs: 0, total_backlogs: 0, resume_url: '/resumes/aarav_sharma_resume.pdf', is_placed: 1 },
    { student_id: 2, user_id: 6, roll_number: '2023CS0102', first_name: 'Priya', last_name: 'Patel', phone: '+91 9123456781', branch: 'CSE', semester: 8, cgpa: 8.85, graduation_year: 2026, active_backlogs: 0, total_backlogs: 0, resume_url: '/resumes/priya_patel_resume.pdf', is_placed: 1 },
    { student_id: 3, user_id: 7, roll_number: '2023IT0201', first_name: 'Rohit', last_name: 'Verma', phone: '+91 9123456782', branch: 'IT', semester: 8, cgpa: 8.10, graduation_year: 2026, active_backlogs: 0, total_backlogs: 0, resume_url: '/resumes/rohit_verma_resume.pdf', is_placed: 0 },
    { student_id: 4, user_id: 8, roll_number: '2023EC0301', first_name: 'Ananya', last_name: 'Iyer', phone: '+91 9123456783', branch: 'ECE', semester: 8, cgpa: 7.60, graduation_year: 2026, active_backlogs: 0, total_backlogs: 1, resume_url: '/resumes/ananya_iyer_resume.pdf', is_placed: 0 },
    { student_id: 5, user_id: 9, roll_number: '2023ME0401', first_name: 'Vikram', last_name: 'Singh', phone: '+91 9123456784', branch: 'MECH', semester: 8, cgpa: 6.80, graduation_year: 2026, active_backlogs: 1, total_backlogs: 2, resume_url: '/resumes/vikram_singh_resume.pdf', is_placed: 0 },
    { student_id: 6, user_id: 10, roll_number: '2023CS0105', first_name: 'Sneha', last_name: 'Reddy', phone: '+91 9123456785', branch: 'CSE', semester: 8, cgpa: 8.45, graduation_year: 2026, active_backlogs: 0, total_backlogs: 0, resume_url: '/resumes/sneha_reddy_resume.pdf', is_placed: 0 }
  ],
  companies: [
    { company_id: 1, user_id: 2, company_name: 'Google India', industry: 'Information Technology & Cloud', website: 'https://careers.google.com', description: 'Google is a global technology leader focused on search, cloud computing, software, and AI.', hr_name: 'Sundar Raghavan', hr_email: 'recruiter@google.com', hr_phone: '+91 9876543210', location: 'Bangalore, Karnataka', is_verified: 1 },
    { company_id: 2, user_id: 3, company_name: 'Microsoft Corporation', industry: 'Software & Cloud Services', website: 'https://careers.microsoft.com', description: 'Microsoft enables digital transformation for the era of an intelligent cloud and edge.', hr_name: 'Neha Kapur', hr_email: 'recruiter@microsoft.com', hr_phone: '+91 9876543211', location: 'Hyderabad, Telangana', is_verified: 1 },
    { company_id: 3, user_id: 4, company_name: 'Infosys Technologies', industry: 'IT Consulting & Services', website: 'https://www.infosys.com/careers', description: 'Infosys is a global leader in next-generation digital services and consulting.', hr_name: 'Amitabh Sen', hr_email: 'careers@infosys.com', hr_phone: '+91 9876543212', location: 'Pune, Maharashtra', is_verified: 1 }
  ],
  skills: [
    { skill_id: 1, skill_name: 'Data Structures & Algorithms', category: 'Computer Science' },
    { skill_id: 2, skill_name: 'Python', category: 'Programming' },
    { skill_id: 3, skill_name: 'Java', category: 'Programming' },
    { skill_id: 4, skill_name: 'C++', category: 'Programming' },
    { skill_id: 5, skill_name: 'JavaScript / TypeScript', category: 'Web Development' },
    { skill_id: 6, skill_name: 'React.js', category: 'Frontend' },
    { skill_id: 7, skill_name: 'Node.js & Express', category: 'Backend' },
    { skill_id: 8, skill_name: 'MySQL / Relational DBMS', category: 'Database' },
    { skill_id: 9, skill_name: 'Cloud Computing (AWS/GCP)', category: 'Cloud & DevOps' },
    { skill_id: 10, skill_name: 'Docker & Kubernetes', category: 'DevOps' },
    { skill_id: 11, skill_name: 'Machine Learning', category: 'AI/Data Science' },
    { skill_id: 12, skill_name: 'Embedded Systems', category: 'Core Engineering' }
  ],
  student_skills: [
    { student_id: 1, skill_id: 1, proficiency: 'Advanced' },
    { student_id: 1, skill_id: 4, proficiency: 'Advanced' },
    { student_id: 1, skill_id: 7, proficiency: 'Intermediate' },
    { student_id: 1, skill_id: 8, proficiency: 'Advanced' },
    { student_id: 2, skill_id: 2, proficiency: 'Advanced' },
    { student_id: 2, skill_id: 5, proficiency: 'Advanced' },
    { student_id: 2, skill_id: 6, proficiency: 'Advanced' },
    { student_id: 2, skill_id: 8, proficiency: 'Intermediate' },
    { student_id: 3, skill_id: 3, proficiency: 'Advanced' },
    { student_id: 3, skill_id: 7, proficiency: 'Intermediate' },
    { student_id: 3, skill_id: 8, proficiency: 'Advanced' },
    { student_id: 4, skill_id: 4, proficiency: 'Intermediate' },
    { student_id: 4, skill_id: 12, proficiency: 'Advanced' },
    { student_id: 4, skill_id: 8, proficiency: 'Beginner' },
    { student_id: 5, skill_id: 2, proficiency: 'Beginner' },
    { student_id: 5, skill_id: 8, proficiency: 'Beginner' },
    { student_id: 6, skill_id: 1, proficiency: 'Intermediate' },
    { student_id: 6, skill_id: 5, proficiency: 'Advanced' },
    { student_id: 6, skill_id: 6, proficiency: 'Advanced' },
    { student_id: 6, skill_id: 7, proficiency: 'Intermediate' }
  ],
  job_postings: [
    { job_id: 1, company_id: 1, title: 'Software Engineer (L3)', description: 'Join Google Core Engineering team developing scalable distributed systems, search indexers, and real-time backend microservices.', role_type: 'Full-time', package_lpa: 28.50, location: 'Bangalore, Karnataka', deadline: new Date('2026-12-15 23:59:59'), status: 'approved', created_at: new Date('2026-09-20') },
    { job_id: 2, company_id: 2, title: 'Software Development Engineer I', description: 'Design, implement, and maintain mission-critical cloud infrastructure and modern web client applications in Azure & Microsoft 365.', role_type: 'Full-time', package_lpa: 24.00, location: 'Hyderabad, Telangana', deadline: new Date('2026-12-20 23:59:59'), status: 'approved', created_at: new Date('2026-09-22') },
    { job_id: 3, company_id: 3, title: 'Systems Engineer Trainee', description: 'Enterprise application development, software quality engineering, cloud migration, and client solutions.', role_type: 'Full-time', package_lpa: 7.50, location: 'Pune, Maharashtra', deadline: new Date('2026-12-30 23:59:59'), status: 'approved', created_at: new Date('2026-09-25') },
    { job_id: 4, company_id: 2, title: 'Full Stack Cloud Intern', description: '6-month pre-placement internship working with React, Go, and Azure Serverless APIs with high full-time conversion opportunities.', role_type: 'Internship', package_lpa: 12.00, location: 'Bangalore / Remote', deadline: new Date('2026-11-30 23:59:59'), status: 'pending_approval', created_at: new Date('2026-10-01') }
  ],
  eligibility: [
    { eligibility_id: 1, job_id: 1, min_cgpa: 8.50, max_active_backlogs: 0, allowed_branches: 'CSE,IT', graduation_year: 2026 },
    { eligibility_id: 2, job_id: 2, min_cgpa: 8.00, max_active_backlogs: 0, allowed_branches: 'CSE,IT,ECE', graduation_year: 2026 },
    { eligibility_id: 3, job_id: 3, min_cgpa: 6.50, max_active_backlogs: 1, allowed_branches: 'CSE,IT,ECE,MECH,CIVIL', graduation_year: 2026 },
    { eligibility_id: 4, job_id: 4, min_cgpa: 7.50, max_active_backlogs: 0, allowed_branches: 'CSE,IT,ECE', graduation_year: 2026 }
  ],
  recruitment_rounds: [
    { round_id: 1, job_id: 1, round_number: 1, round_name: 'Online Coding Assessment', round_type: 'Online Test', description: '90-minute algorithmic coding test on HackerEarth focusing on DP and Graphs.' },
    { round_id: 2, job_id: 1, round_number: 2, round_name: 'Data Structures & Algorithms Tech Round', round_type: 'Technical', description: 'Deep dive into algorithmic complexity, data structures, and problem solving.' },
    { round_id: 3, job_id: 1, round_number: 3, round_name: 'System Design & Googliness HR', round_type: 'HR', description: 'High-level architecture design and culture alignment interview.' },
    { round_id: 4, job_id: 2, round_number: 1, round_name: 'Online Technical MCQ & Coding', round_type: 'Online Test', description: '60-minute online screening on Codility.' },
    { round_id: 5, job_id: 2, round_number: 2, round_name: 'Technical Interview 1', round_type: 'Technical', description: 'Live coding and object-oriented architecture evaluation.' },
    { round_id: 6, job_id: 2, round_number: 3, round_name: 'Director & HR Round', round_type: 'HR', description: 'Final behavioral and project experience discussion.' },
    { round_id: 7, job_id: 3, round_number: 1, round_name: 'Infosys InfyTQ Assessment', round_type: 'Online Test', description: 'Aptitude, quantitative reasoning, and foundational Java/Python test.' }
  ],
  applications: [
    { application_id: 1, job_id: 1, student_id: 1, status: 'Selected', applied_at: new Date('2026-10-01 10:30:00'), notes: 'Top scorer in coding assessment.' },
    { application_id: 2, job_id: 1, student_id: 2, status: 'Under Review', applied_at: new Date('2026-10-02 11:15:00'), notes: 'Cleared initial resume filtering.' },
    { application_id: 3, job_id: 2, student_id: 2, status: 'Selected', applied_at: new Date('2026-10-03 14:00:00'), notes: 'Exceptional performance in technical rounds.' },
    { application_id: 4, job_id: 2, student_id: 3, status: 'Interview Scheduled', applied_at: new Date('2026-10-04 16:20:00'), notes: 'Advanced to Technical Round 2.' },
    { application_id: 5, job_id: 2, student_id: 4, status: 'Rejected', applied_at: new Date('2026-10-05 09:10:00'), notes: 'Did not clear round 1 cutoff.' },
    { application_id: 6, job_id: 3, student_id: 3, status: 'Shortlisted', applied_at: new Date('2026-10-06 12:00:00'), notes: 'Eligible and shortlisted for online test.' },
    { application_id: 7, job_id: 3, student_id: 4, status: 'Applied', applied_at: new Date('2026-10-07 13:45:00'), notes: 'Awaiting batch assessment invite.' },
    { application_id: 8, job_id: 3, student_id: 5, status: 'Applied', applied_at: new Date('2026-10-08 15:30:00'), notes: 'Applied under MECH eligible quota.' }
  ],
  application_history: [
    { history_id: 1, application_id: 1, old_status: null, new_status: 'Applied', remarks: 'Student submitted initial application', changed_at: new Date('2026-10-01 10:30:00') },
    { history_id: 2, application_id: 1, old_status: 'Applied', new_status: 'Shortlisted', remarks: 'Automated eligibility check passed (CGPA 9.4 >= 8.5)', changed_at: new Date('2026-10-03 09:00:00') },
    { history_id: 3, application_id: 1, old_status: 'Shortlisted', new_status: 'Interview Scheduled', remarks: 'Scheduled for DSA Tech Round', changed_at: new Date('2026-10-05 14:00:00') },
    { history_id: 4, application_id: 1, old_status: 'Interview Scheduled', new_status: 'Selected', remarks: 'Final offer approved by Google Recruitment Team', changed_at: new Date('2026-10-12 18:00:00') },
    { history_id: 5, application_id: 3, old_status: null, new_status: 'Applied', remarks: 'Student submitted initial application', changed_at: new Date('2026-10-03 14:00:00') },
    { history_id: 6, application_id: 3, old_status: 'Applied', new_status: 'Interview Scheduled', remarks: 'Passed online screening test', changed_at: new Date('2026-10-07 11:00:00') },
    { history_id: 7, application_id: 3, old_status: 'Interview Scheduled', new_status: 'Selected', remarks: 'Selected for Azure Core Engineering', changed_at: new Date('2026-10-15 16:30:00') },
    { history_id: 8, application_id: 4, old_status: null, new_status: 'Applied', remarks: 'Student submitted initial application', changed_at: new Date('2026-10-04 16:20:00') },
    { history_id: 9, application_id: 4, old_status: 'Applied', new_status: 'Interview Scheduled', remarks: 'Round 2 scheduled with Principal Architect', changed_at: new Date('2026-10-10 10:00:00') }
  ],
  interviews: [
    { interview_id: 1, application_id: 1, round_id: 2, scheduled_time: new Date('2026-10-08 11:00:00'), meeting_link: 'https://meet.google.com/xyz-abcd-qwe', location: 'Google Meet (Virtual)', feedback: 'Excellent problem solving in Dynamic Programming and Graph traversals.', status: 'Completed', result: 'Passed' },
    { interview_id: 2, application_id: 1, round_id: 3, scheduled_time: new Date('2026-10-11 15:30:00'), meeting_link: 'https://meet.google.com/uvw-rstu-mno', location: 'Google Meet (Virtual)', feedback: 'Strong architectural intuition and great communication skills.', status: 'Completed', result: 'Passed' },
    { interview_id: 3, application_id: 3, round_id: 5, scheduled_time: new Date('2026-10-10 14:00:00'), meeting_link: 'https://teams.microsoft.com/l/meetup/12345', location: 'MS Teams (Virtual)', feedback: 'Demonstrated thorough knowledge of React, Node.js, and DB concurrency.', status: 'Completed', result: 'Passed' },
    { interview_id: 4, application_id: 4, round_id: 5, scheduled_time: new Date('2026-11-10 10:00:00'), meeting_link: 'https://teams.microsoft.com/l/meetup/67890', location: 'MS Teams (Virtual)', feedback: 'Upcoming technical interview with Senior Engineer.', status: 'Scheduled', result: 'Pending' }
  ],
  offers: [
    { offer_id: 1, application_id: 1, student_id: 1, job_id: 1, package_offered: 28.50, joining_date: new Date('2027-07-01'), offer_letter_url: '/offers/google_offer_aarav_sharma.pdf', status: 'Accepted' },
    { offer_id: 2, application_id: 3, student_id: 2, job_id: 2, package_offered: 24.00, joining_date: new Date('2027-07-15'), offer_letter_url: '/offers/microsoft_offer_priya_patel.pdf', status: 'Accepted' }
  ]
};

// Initialize pool and verify connectivity
async function initPool() {
  try {
    pool = mysql.createPool(config);
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    isConnected = true;
    fallbackMode = false;
    console.log(`[Database] Successfully connected to MySQL database '${config.database}' at ${config.host}:${config.port}`);
  } catch (err) {
    isConnected = false;
    fallbackMode = true;
    console.warn(`[Database Warning] Could not connect to MySQL server at ${config.host}:${config.port} (${err.code || err.message}).`);
    console.log(`[Database] Switched to Standalone In-Memory Database Adapter with pre-loaded realistic data.`);
    console.log(`[Database] Tip: Start your MySQL service and run 'npm run db:init' to use live MySQL.`);
  }
}

initPool();

/**
 * Execute query against MySQL or fallback adapter
 */
async function query(sql, params = []) {
  if (isConnected && pool) {
    try {
      return await pool.query(sql, params);
    } catch (err) {
      console.error('[MySQL Query Error]:', err.message, 'SQL:', sql);
      throw err;
    }
  }

  // Fallback In-Memory Query Router for common relational operations
  return handleFallbackQuery(sql, params);
}

function handleFallbackQuery(sql, params) {
  const cleanSql = sql.trim().replace(/\s+/g, ' ');
  const upper = cleanSql.toUpperCase();

  // 1. SELECT Users by email
  if (upper.includes('SELECT * FROM USERS WHERE EMAIL =') || upper.includes('FROM USERS WHERE EMAIL = ?')) {
    const email = params[0];
    const user = fallbackStore.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
    return [[user].filter(Boolean), []];
  }

  // 2. SELECT User by user_id
  if (upper.includes('SELECT * FROM USERS WHERE USER_ID =') || upper.includes('FROM USERS WHERE USER_ID = ?')) {
    const id = params[0];
    const user = fallbackStore.users.find(u => u.user_id === Number(id));
    return [[user].filter(Boolean), []];
  }

  // 3. INSERT INTO users
  if (upper.startsWith('INSERT INTO USERS')) {
    const newId = fallbackStore.users.length ? Math.max(...fallbackStore.users.map(u => u.user_id)) + 1 : 1;
    const [email, password_hash, role] = params;
    const newUser = { user_id: newId, email, password_hash, role, is_active: 1, created_at: new Date() };
    fallbackStore.users.push(newUser);
    return [{ insertId: newId, affectedRows: 1 }, []];
  }

  // 4. INSERT INTO students
  if (upper.startsWith('INSERT INTO STUDENTS')) {
    const newId = fallbackStore.students.length ? Math.max(...fallbackStore.students.map(s => s.student_id)) + 1 : 1;
    const [user_id, roll_number, first_name, last_name, phone, branch, semester, cgpa, graduation_year, active_backlogs, total_backlogs] = params;
    const newStudent = {
      student_id: newId, user_id, roll_number, first_name, last_name, phone, branch,
      semester: Number(semester) || 8, cgpa: Number(cgpa) || 7.0, graduation_year: Number(graduation_year) || 2026,
      active_backlogs: Number(active_backlogs) || 0, total_backlogs: Number(total_backlogs) || 0,
      resume_url: null, is_placed: 0
    };
    fallbackStore.students.push(newStudent);
    return [{ insertId: newId, affectedRows: 1 }, []];
  }

  // 5. INSERT INTO companies
  if (upper.startsWith('INSERT INTO COMPANIES')) {
    const newId = fallbackStore.companies.length ? Math.max(...fallbackStore.companies.map(c => c.company_id)) + 1 : 1;
    const [user_id, company_name, industry, website, description, hr_name, hr_email, hr_phone, location] = params;
    const newCompany = {
      company_id: newId, user_id, company_name, industry, website, description,
      hr_name, hr_email, hr_phone, location, is_verified: 0
    };
    fallbackStore.companies.push(newCompany);
    return [{ insertId: newId, affectedRows: 1 }, []];
  }

  // 6. SELECT Student profile by user_id or student_id
  if (upper.includes('FROM STUDENTS') && (upper.includes('USER_ID =') || upper.includes('USER_ID=?'))) {
    const userId = Number(params[0]);
    const student = fallbackStore.students.find(s => s.user_id === userId);
    if (!student) return [[], []];
    const user = fallbackStore.users.find(u => u.user_id === student.user_id);
    return [[{ ...student, email: user ? user.email : '' }], []];
  }

  if (upper.includes('FROM STUDENTS') && (upper.includes('STUDENT_ID =') || upper.includes('STUDENT_ID=?'))) {
    const studentId = Number(params[0]);
    const student = fallbackStore.students.find(s => s.student_id === studentId);
    if (!student) return [[], []];
    const user = fallbackStore.users.find(u => u.user_id === student.user_id);
    return [[{ ...student, email: user ? user.email : '' }], []];
  }

  // 7. SELECT Company profile by user_id or company_id
  if (upper.includes('FROM COMPANIES') && (upper.includes('USER_ID =') || upper.includes('USER_ID=?'))) {
    const userId = Number(params[0]);
    const company = fallbackStore.companies.find(c => c.user_id === userId);
    if (!company) return [[], []];
    const user = fallbackStore.users.find(u => u.user_id === company.user_id);
    return [[{ ...company, email: user ? user.email : '' }], []];
  }

  if (upper.includes('FROM COMPANIES') && (upper.includes('COMPANY_ID =') || upper.includes('COMPANY_ID=?'))) {
    const companyId = Number(params[0]);
    const company = fallbackStore.companies.find(c => c.company_id === companyId);
    if (!company) return [[], []];
    const user = fallbackStore.users.find(u => u.user_id === company.user_id);
    return [[{ ...company, email: user ? user.email : '' }], []];
  }

  // 8. UPDATE students profile
  if (upper.startsWith('UPDATE STUDENTS')) {
    const [phone, branch, semester, cgpa, graduation_year, active_backlogs, total_backlogs, student_id] = params;
    const s = fallbackStore.students.find(st => st.student_id === Number(student_id));
    if (s) {
      if (phone !== undefined) s.phone = phone;
      if (branch !== undefined) s.branch = branch;
      if (semester !== undefined) s.semester = Number(semester);
      if (cgpa !== undefined) s.cgpa = Number(cgpa);
      if (graduation_year !== undefined) s.graduation_year = Number(graduation_year);
      if (active_backlogs !== undefined) s.active_backlogs = Number(active_backlogs);
      if (total_backlogs !== undefined) s.total_backlogs = Number(total_backlogs);
    }
    return [{ affectedRows: s ? 1 : 0 }, []];
  }

  // 9. Student Skills
  if (upper.includes('FROM STUDENT_SKILLS SS JOIN SKILLS SK') && upper.includes('WHERE SS.STUDENT_ID =')) {
    const studentId = Number(params[0]);
    const list = fallbackStore.student_skills
      .filter(ss => ss.student_id === studentId)
      .map(ss => {
        const sk = fallbackStore.skills.find(k => k.skill_id === ss.skill_id);
        return {
          student_id: ss.student_id,
          skill_id: ss.skill_id,
          proficiency: ss.proficiency,
          skill_name: sk ? sk.skill_name : 'Unknown',
          category: sk ? sk.category : 'General'
        };
      });
    return [list, []];
  }

  // 10. Master Skills list
  if (upper.includes('FROM SKILLS')) {
    return [fallbackStore.skills, []];
  }

  // 11. Jobs list with Company & Eligibility (for Students or Public)
  if (upper.includes('FROM JOB_POSTINGS J') && upper.includes('JOIN COMPANIES C') && upper.includes('JOIN ELIGIBILITY E')) {
    let jobs = fallbackStore.job_postings.map(j => {
      const c = fallbackStore.companies.find(comp => comp.company_id === j.company_id);
      const e = fallbackStore.eligibility.find(el => el.job_id === j.job_id);
      const appCount = fallbackStore.applications.filter(a => a.job_id === j.job_id).length;
      return {
        job_id: j.job_id,
        company_id: j.company_id,
        company_name: c ? c.company_name : 'Company',
        company_logo: null,
        industry: c ? c.industry : '',
        title: j.title,
        description: j.description,
        role_type: j.role_type,
        package_lpa: j.package_lpa,
        location: j.location,
        deadline: j.deadline,
        status: j.status,
        created_at: j.created_at,
        min_cgpa: e ? e.min_cgpa : 6.0,
        max_active_backlogs: e ? e.max_active_backlogs : 0,
        allowed_branches: e ? e.allowed_branches : '*',
        graduation_year: e ? e.graduation_year : 2026,
        applicant_count: appCount
      };
    });

    if (upper.includes("J.STATUS = 'APPROVED'")) {
      jobs = jobs.filter(j => j.status === 'approved');
    }

    if (upper.includes('WHERE J.JOB_ID = ?') || upper.includes('WHERE J.JOB_ID =')) {
      const jobId = Number(params[0]);
      jobs = jobs.filter(j => j.job_id === jobId);
    } else if (params.length > 0 && typeof params[0] === 'number') {
      const companyId = params[0];
      jobs = jobs.filter(j => j.company_id === companyId);
    }

    return [jobs, []];
  }

  // 12. Student Applications with Details
  if (upper.includes('FROM APPLICATIONS A') && upper.includes('JOIN JOB_POSTINGS J')) {
    const studentId = params[0] ? Number(params[0]) : null;
    let apps = fallbackStore.applications;
    if (studentId && upper.includes('WHERE A.STUDENT_ID =')) {
      apps = apps.filter(a => a.student_id === studentId);
    }
    const result = apps.map(a => {
      const j = fallbackStore.job_postings.find(job => job.job_id === a.job_id) || {};
      const c = fallbackStore.companies.find(comp => comp.company_id === j.company_id) || {};
      const offer = fallbackStore.offers.find(o => o.application_id === a.application_id);
      return {
        application_id: a.application_id,
        job_id: a.job_id,
        student_id: a.student_id,
        status: a.status,
        applied_at: a.applied_at,
        notes: a.notes,
        title: j.title,
        package_lpa: j.package_lpa,
        role_type: j.role_type,
        location: j.location,
        company_name: c.company_name,
        package_offered: offer ? offer.package_offered : null,
        offer_status: offer ? offer.status : null
      };
    });
    return [result, []];
  }

  // 13. Applications by Job ID (for Recruiters)
  if (upper.includes('FROM APPLICATIONS A') && upper.includes('JOIN STUDENTS S') && upper.includes('WHERE A.JOB_ID =')) {
    const jobId = Number(params[0]);
    const apps = fallbackStore.applications.filter(a => a.job_id === jobId).map(a => {
      const s = fallbackStore.students.find(st => st.student_id === a.student_id) || {};
      const u = fallbackStore.users.find(usr => usr.user_id === s.user_id) || {};
      return {
        application_id: a.application_id,
        job_id: a.job_id,
        student_id: a.student_id,
        status: a.status,
        applied_at: a.applied_at,
        notes: a.notes,
        first_name: s.first_name,
        last_name: s.last_name,
        roll_number: s.roll_number,
        email: u.email,
        branch: s.branch,
        cgpa: s.cgpa,
        active_backlogs: s.active_backlogs,
        resume_url: s.resume_url,
        is_placed: s.is_placed
      };
    });
    return [apps, []];
  }

  // 14. Check Existing Application (Prevent Duplicate)
  if (upper.includes('FROM APPLICATIONS WHERE JOB_ID =') && upper.includes('AND STUDENT_ID =')) {
    const [jobId, studentId] = params.map(Number);
    const existing = fallbackStore.applications.find(a => a.job_id === jobId && a.student_id === studentId);
    return [[existing].filter(Boolean), []];
  }

  // 15. INSERT INTO applications
  if (upper.startsWith('INSERT INTO APPLICATIONS')) {
    const [jobId, studentId, notes] = params;
    const newId = fallbackStore.applications.length ? Math.max(...fallbackStore.applications.map(a => a.application_id)) + 1 : 1;
    const newApp = {
      application_id: newId,
      job_id: Number(jobId),
      student_id: Number(studentId),
      status: 'Applied',
      applied_at: new Date(),
      notes: notes || 'Direct portal application'
    };
    fallbackStore.applications.push(newApp);

    // Audit log entry
    fallbackStore.application_history.push({
      history_id: fallbackStore.application_history.length + 1,
      application_id: newId,
      old_status: null,
      new_status: 'Applied',
      remarks: 'Application submitted',
      changed_at: new Date()
    });

    return [{ insertId: newId, affectedRows: 1 }, []];
  }

  // 16. UPDATE Application status
  if (upper.startsWith('UPDATE APPLICATIONS SET STATUS =')) {
    const [newStatus, applicationId] = params;
    const app = fallbackStore.applications.find(a => a.application_id === Number(applicationId));
    if (app) {
      const oldStatus = app.status;
      app.status = newStatus;

      fallbackStore.application_history.push({
        history_id: fallbackStore.application_history.length + 1,
        application_id: app.application_id,
        old_status: oldStatus,
        new_status: newStatus,
        remarks: `Status updated to ${newStatus}`,
        changed_at: new Date()
      });

      if (newStatus === 'Selected') {
        const student = fallbackStore.students.find(s => s.student_id === app.student_id);
        if (student) student.is_placed = 1;
        const job = fallbackStore.job_postings.find(j => j.job_id === app.job_id);
        if (!fallbackStore.offers.some(o => o.application_id === app.application_id)) {
          fallbackStore.offers.push({
            offer_id: fallbackStore.offers.length + 1,
            application_id: app.application_id,
            student_id: app.student_id,
            job_id: app.job_id,
            package_offered: job ? job.package_lpa : 12.0,
            joining_date: new Date('2027-07-01'),
            offer_letter_url: '/offers/provisional_offer.pdf',
            status: 'Offered'
          });
        }
      }
    }
    return [{ affectedRows: app ? 1 : 0 }, []];
  }

  // 17. Recruitment rounds
  if (upper.includes('FROM RECRUITMENT_ROUNDS') && upper.includes('WHERE JOB_ID =')) {
    const jobId = Number(params[0]);
    const rounds = fallbackStore.recruitment_rounds.filter(r => r.job_id === jobId);
    return [rounds, []];
  }

  // 18. Interviews
  if (upper.includes('FROM INTERVIEWS I')) {
    let list = fallbackStore.interviews.map(i => {
      const app = fallbackStore.applications.find(a => a.application_id === i.application_id) || {};
      const student = fallbackStore.students.find(s => s.student_id === app.student_id) || {};
      const job = fallbackStore.job_postings.find(j => j.job_id === app.job_id) || {};
      const round = fallbackStore.recruitment_rounds.find(r => r.round_id === i.round_id) || {};
      const company = fallbackStore.companies.find(c => c.company_id === job.company_id) || {};
      return {
        ...i,
        student_id: app.student_id,
        first_name: student.first_name,
        last_name: student.last_name,
        roll_number: student.roll_number,
        job_id: app.job_id,
        job_title: job.title,
        company_id: job.company_id,
        company_name: company.company_name,
        round_name: round.round_name,
        round_type: round.round_type
      };
    });

    if (upper.includes('WHERE A.STUDENT_ID =') || upper.includes('WHERE APP.STUDENT_ID =')) {
      const studentId = Number(params[0]);
      list = list.filter(item => item.student_id === studentId);
    } else if (upper.includes('WHERE J.COMPANY_ID =') || upper.includes('WHERE JOB.COMPANY_ID =')) {
      const compId = Number(params[0]);
      list = list.filter(item => item.company_id === compId);
    }
    return [list, []];
  }

  // 19. INSERT Interview
  if (upper.startsWith('INSERT INTO INTERVIEWS')) {
    const [application_id, round_id, scheduled_time, meeting_link, location, feedback] = params;
    const newId = fallbackStore.interviews.length ? Math.max(...fallbackStore.interviews.map(i => i.interview_id)) + 1 : 1;
    const newInt = {
      interview_id: newId,
      application_id: Number(application_id),
      round_id: Number(round_id),
      scheduled_time: new Date(scheduled_time),
      meeting_link: meeting_link || 'https://meet.google.com/new',
      location: location || 'Virtual / Online',
      feedback: feedback || '',
      status: 'Scheduled',
      result: 'Pending'
    };
    fallbackStore.interviews.push(newInt);
    // update app status
    const app = fallbackStore.applications.find(a => a.application_id === Number(application_id));
    if (app && app.status !== 'Selected') app.status = 'Interview Scheduled';
    return [{ insertId: newId, affectedRows: 1 }, []];
  }

  // 20. Admin Analytics & Overall Reports
  if (upper.includes('COUNT(DISTINCT S.STUDENT_ID) AS TOTAL_STUDENTS') || upper.includes('VIEW_PLACEMENT_STATISTICS') || upper.includes('VW_PLACEMENT_SUMMARY')) {
    const totalStudents = fallbackStore.students.length;
    const placedStudents = fallbackStore.students.filter(s => s.is_placed === 1).length;
    const totalCompanies = fallbackStore.companies.length;
    const activeJobs = fallbackStore.job_postings.filter(j => j.status === 'approved').length;
    const totalApplications = fallbackStore.applications.length;
    const offers = fallbackStore.offers;
    const avgPackage = offers.length ? (offers.reduce((acc, o) => acc + Number(o.package_offered), 0) / offers.length).toFixed(2) : 0;
    const maxPackage = offers.length ? Math.max(...offers.map(o => Number(o.package_offered))).toFixed(2) : 0;

    return [[{
      total_students: totalStudents,
      placed_students: placedStudents,
      unplaced_students: totalStudents - placedStudents,
      placement_rate: totalStudents ? ((placedStudents / totalStudents) * 100).toFixed(1) : 0,
      total_companies: totalCompanies,
      active_jobs: activeJobs,
      total_applications: totalApplications,
      avg_package: avgPackage,
      highest_package: maxPackage
    }], []];
  }

  // Default fallback for general queries
  return [[], []];
}

module.exports = {
  query,
  checkDbStatus: () => ({ isConnected, fallbackMode, database: config.database, host: config.host }),
  getFallbackStore: () => fallbackStore
};
