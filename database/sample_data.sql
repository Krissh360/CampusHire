-- ============================================================================
-- CampusHire — College Placement and Recruitment Management System
-- Realistic Academic Sample Data Seed
-- Default Password for all demo accounts: password123
-- ============================================================================

USE campushire_db;

-- ----------------------------------------------------------------------------
-- 1. SEED USERS
-- Password hash corresponds to 'password123' verified via bcryptjs (10 rounds)
-- ----------------------------------------------------------------------------
INSERT INTO users (user_id, email, password_hash, role, is_active) VALUES
(1, 'admin@campushire.edu', '$2a$10$x32/kxqAyyFuqH4yQaeIG.dJTmv/MmAzR3ataQrqnTNjZDbNohzEW', 'admin', TRUE),
(2, 'recruiter@google.com', '$2a$10$x32/kxqAyyFuqH4yQaeIG.dJTmv/MmAzR3ataQrqnTNjZDbNohzEW', 'company', TRUE),
(3, 'recruiter@microsoft.com', '$2a$10$x32/kxqAyyFuqH4yQaeIG.dJTmv/MmAzR3ataQrqnTNjZDbNohzEW', 'company', TRUE),
(4, 'careers@infosys.com', '$2a$10$x32/kxqAyyFuqH4yQaeIG.dJTmv/MmAzR3ataQrqnTNjZDbNohzEW', 'company', TRUE),
(5, 'aarav.sharma@college.edu', '$2a$10$x32/kxqAyyFuqH4yQaeIG.dJTmv/MmAzR3ataQrqnTNjZDbNohzEW', 'student', TRUE),
(6, 'priya.patel@college.edu', '$2a$10$x32/kxqAyyFuqH4yQaeIG.dJTmv/MmAzR3ataQrqnTNjZDbNohzEW', 'student', TRUE),
(7, 'rohit.verma@college.edu', '$2a$10$x32/kxqAyyFuqH4yQaeIG.dJTmv/MmAzR3ataQrqnTNjZDbNohzEW', 'student', TRUE),
(8, 'ananya.iyer@college.edu', '$2a$10$x32/kxqAyyFuqH4yQaeIG.dJTmv/MmAzR3ataQrqnTNjZDbNohzEW', 'student', TRUE),
(9, 'vikram.singh@college.edu', '$2a$10$x32/kxqAyyFuqH4yQaeIG.dJTmv/MmAzR3ataQrqnTNjZDbNohzEW', 'student', TRUE),
(10, 'sneha.reddy@college.edu', '$2a$10$x32/kxqAyyFuqH4yQaeIG.dJTmv/MmAzR3ataQrqnTNjZDbNohzEW', 'student', TRUE);

-- ----------------------------------------------------------------------------
-- 2. SEED COMPANIES
-- ----------------------------------------------------------------------------
INSERT INTO companies (company_id, user_id, company_name, industry, website, description, hr_name, hr_email, hr_phone, location, is_verified) VALUES
(1, 2, 'Google India', 'Information Technology & Cloud', 'https://careers.google.com', 'Google is a global technology leader focused on search, cloud computing, software, and AI.', 'Sundar Raghavan', 'recruiter@google.com', '+91 9876543210', 'Bangalore, Karnataka', TRUE),
(2, 3, 'Microsoft Corporation', 'Software & Cloud Services', 'https://careers.microsoft.com', 'Microsoft enables digital transformation for the era of an intelligent cloud and edge.', 'Neha Kapur', 'recruiter@microsoft.com', '+91 9876543211', 'Hyderabad, Telangana', TRUE),
(3, 4, 'Infosys Technologies', 'IT Consulting & Services', 'https://www.infosys.com/careers', 'Infosys is a global leader in next-generation digital services and consulting.', 'Amitabh Sen', 'careers@infosys.com', '+91 9876543212', 'Pune, Maharashtra', TRUE);

-- ----------------------------------------------------------------------------
-- 3. SEED STUDENTS
-- Diverse branches, semester 8, 2026/2027 batch, varied CGPA & backlogs
-- ----------------------------------------------------------------------------
INSERT INTO students (student_id, user_id, roll_number, first_name, last_name, phone, branch, semester, cgpa, graduation_year, active_backlogs, total_backlogs, resume_url, is_placed) VALUES
(1, 5, '2023CS0101', 'Aarav', 'Sharma', '+91 9123456780', 'CSE', 8, 9.40, 2026, 0, 0, '/resumes/aarav_sharma_resume.pdf', TRUE),
(2, 6, '2023CS0102', 'Priya', 'Patel', '+91 9123456781', 'CSE', 8, 8.85, 2026, 0, 0, '/resumes/priya_patel_resume.pdf', TRUE),
(3, 7, '2023IT0201', 'Rohit', 'Verma', '+91 9123456782', 'IT', 8, 8.10, 2026, 0, 0, '/resumes/rohit_verma_resume.pdf', FALSE),
(4, 8, '2023EC0301', 'Ananya', 'Iyer', '+91 9123456783', 'ECE', 8, 7.60, 2026, 0, 1, '/resumes/ananya_iyer_resume.pdf', FALSE),
(5, 9, '2023ME0401', 'Vikram', 'Singh', '+91 9123456784', 'MECH', 8, 6.80, 2026, 1, 2, '/resumes/vikram_singh_resume.pdf', FALSE),
(6, 10, '2023CS0105', 'Sneha', 'Reddy', '+91 9123456785', 'CSE', 8, 8.45, 2026, 0, 0, '/resumes/sneha_reddy_resume.pdf', FALSE);

-- ----------------------------------------------------------------------------
-- 4. SEED SKILLS CATALOG
-- ----------------------------------------------------------------------------
INSERT INTO skills (skill_id, skill_name, category) VALUES
(1, 'Data Structures & Algorithms', 'Computer Science'),
(2, 'Python', 'Programming'),
(3, 'Java', 'Programming'),
(4, 'C++', 'Programming'),
(5, 'JavaScript / TypeScript', 'Web Development'),
(6, 'React.js', 'Frontend'),
(7, 'Node.js & Express', 'Backend'),
(8, 'MySQL / Relational DBMS', 'Database'),
(9, 'Cloud Computing (AWS/GCP)', 'Cloud & DevOps'),
(10, 'Docker & Kubernetes', 'DevOps'),
(11, 'Machine Learning', 'AI/Data Science'),
(12, 'Embedded Systems', 'Core Engineering');

-- ----------------------------------------------------------------------------
-- 5. SEED STUDENT_SKILLS
-- ----------------------------------------------------------------------------
INSERT INTO student_skills (student_id, skill_id, proficiency) VALUES
(1, 1, 'Advanced'), (1, 4, 'Advanced'), (1, 7, 'Intermediate'), (1, 8, 'Advanced'),
(2, 2, 'Advanced'), (2, 5, 'Advanced'), (2, 6, 'Advanced'), (2, 8, 'Intermediate'),
(3, 3, 'Advanced'), (3, 7, 'Intermediate'), (3, 8, 'Advanced'),
(4, 4, 'Intermediate'), (4, 12, 'Advanced'), (4, 8, 'Beginner'),
(5, 2, 'Beginner'), (5, 8, 'Beginner'),
(6, 1, 'Intermediate'), (6, 5, 'Advanced'), (6, 6, 'Advanced'), (6, 7, 'Intermediate');

-- ----------------------------------------------------------------------------
-- 6. SEED JOB_POSTINGS
-- ----------------------------------------------------------------------------
INSERT INTO job_postings (job_id, company_id, title, description, role_type, package_lpa, location, deadline, status) VALUES
(1, 1, 'Software Engineer (L3)', 'Join Google Core Engineering team developing scalable distributed systems, search indexers, and real-time backend microservices.', 'Full-time', 28.50, 'Bangalore, Karnataka', '2026-12-15 23:59:59', 'approved'),
(2, 2, 'Software Development Engineer I', 'Design, implement, and maintain mission-critical cloud infrastructure and modern web client applications in Azure & Microsoft 365.', 'Full-time', 24.00, 'Hyderabad, Telangana', '2026-12-20 23:59:59', 'approved'),
(3, 3, 'Systems Engineer Trainee', 'Enterprise application development, software quality engineering, cloud migration, and client solutions.', 'Full-time', 7.50, 'Pune, Maharashtra', '2026-12-30 23:59:59', 'approved'),
(4, 2, 'Full Stack Cloud Intern', '6-month pre-placement internship working with React, Go, and Azure Serverless APIs with high full-time conversion opportunities.', 'Internship', 12.00, 'Bangalore / Remote', '2026-11-30 23:59:59', 'pending_approval');

-- ----------------------------------------------------------------------------
-- 7. SEED ELIGIBILITY CRITERIA
-- ----------------------------------------------------------------------------
INSERT INTO eligibility (eligibility_id, job_id, min_cgpa, max_active_backlogs, allowed_branches, graduation_year) VALUES
(1, 1, 8.50, 0, 'CSE,IT', 2026),
(2, 2, 8.00, 0, 'CSE,IT,ECE', 2026),
(3, 3, 6.50, 1, 'CSE,IT,ECE,MECH,CIVIL', 2026),
(4, 4, 7.50, 0, 'CSE,IT,ECE', 2026);

-- ----------------------------------------------------------------------------
-- 8. SEED RECRUITMENT_ROUNDS
-- ----------------------------------------------------------------------------
INSERT INTO recruitment_rounds (round_id, job_id, round_number, round_name, round_type, description) VALUES
(1, 1, 1, 'Online Coding Assessment', 'Online Test', '90-minute algorithmic coding test on HackerEarth focusing on DP and Graphs.'),
(2, 1, 2, 'Data Structures & Algorithms Tech Round', 'Technical', 'Deep dive into algorithmic complexity, data structures, and problem solving.'),
(3, 1, 3, 'System Design & Googliness HR', 'HR', 'High-level architecture design and culture alignment interview.'),
(4, 2, 1, 'Online Technical MCQ & Coding', 'Online Test', '60-minute online screening on Codility.'),
(5, 2, 2, 'Technical Interview 1', 'Technical', 'Live coding and object-oriented architecture evaluation.'),
(6, 2, 3, 'Director & HR Round', 'HR', 'Final behavioral and project experience discussion.'),
(7, 3, 1, 'Infosys InfyTQ Assessment', 'Online Test', 'Aptitude, quantitative reasoning, and foundational Java/Python test.');

-- ----------------------------------------------------------------------------
-- 9. SEED APPLICATIONS
-- ----------------------------------------------------------------------------
INSERT INTO applications (application_id, job_id, student_id, status, applied_at, notes) VALUES
(1, 1, 1, 'Selected', '2026-10-01 10:30:00', 'Top scorer in coding assessment.'),
(2, 1, 2, 'Under Review', '2026-10-02 11:15:00', 'Cleared initial resume filtering.'),
(3, 2, 2, 'Selected', '2026-10-03 14:00:00', 'Exceptional performance in technical rounds.'),
(4, 2, 3, 'Interview Scheduled', '2026-10-04 16:20:00', 'Advanced to Technical Round 2.'),
(5, 2, 4, 'Rejected', '2026-10-05 09:10:00', 'Did not clear round 1 cutoff.'),
(6, 3, 3, 'Shortlisted', '2026-10-06 12:00:00', 'Eligible and shortlisted for online test.'),
(7, 3, 4, 'Applied', '2026-10-07 13:45:00', 'Awaiting batch assessment invite.'),
(8, 3, 5, 'Applied', '2026-10-08 15:30:00', 'Applied under MECH eligible quota.');

-- ----------------------------------------------------------------------------
-- 10. SEED APPLICATION_HISTORY (Audit Log)
-- ----------------------------------------------------------------------------
INSERT INTO application_history (application_id, old_status, new_status, remarks, changed_at) VALUES
(1, NULL, 'Applied', 'Student submitted initial application', '2026-10-01 10:30:00'),
(1, 'Applied', 'Shortlisted', 'Automated eligibility check passed (CGPA 9.4 >= 8.5)', '2026-10-03 09:00:00'),
(1, 'Shortlisted', 'Interview Scheduled', 'Scheduled for DSA Tech Round', '2026-10-05 14:00:00'),
(1, 'Interview Scheduled', 'Selected', 'Final offer approved by Google Recruitment Team', '2026-10-12 18:00:00'),
(3, NULL, 'Applied', 'Student submitted initial application', '2026-10-03 14:00:00'),
(3, 'Applied', 'Interview Scheduled', 'Passed online screening test', '2026-10-07 11:00:00'),
(3, 'Interview Scheduled', 'Selected', 'Selected for Azure Core Engineering', '2026-10-15 16:30:00'),
(4, NULL, 'Applied', 'Student submitted initial application', '2026-10-04 16:20:00'),
(4, 'Applied', 'Interview Scheduled', 'Round 2 scheduled with Principal Architect', '2026-10-10 10:00:00');

-- ----------------------------------------------------------------------------
-- 11. SEED INTERVIEWS
-- ----------------------------------------------------------------------------
INSERT INTO interviews (interview_id, application_id, round_id, scheduled_time, meeting_link, location, feedback, status, result) VALUES
(1, 1, 2, '2026-10-08 11:00:00', 'https://meet.google.com/xyz-abcd-qwe', 'Google Meet (Virtual)', 'Excellent problem solving in Dynamic Programming and Graph traversals.', 'Completed', 'Passed'),
(2, 1, 3, '2026-10-11 15:30:00', 'https://meet.google.com/uvw-rstu-mno', 'Google Meet (Virtual)', 'Strong architectural intuition and great communication skills.', 'Completed', 'Passed'),
(3, 3, 5, '2026-10-10 14:00:00', 'https://teams.microsoft.com/l/meetup/12345', 'MS Teams (Virtual)', 'Demonstrated thorough knowledge of React, Node.js, and DB concurrency.', 'Completed', 'Passed'),
(4, 4, 5, '2026-11-10 10:00:00', 'https://teams.microsoft.com/l/meetup/67890', 'MS Teams (Virtual)', 'Upcoming technical interview with Senior Engineer.', 'Scheduled', 'Pending');

-- ----------------------------------------------------------------------------
-- 12. SEED OFFERS
-- ----------------------------------------------------------------------------
INSERT INTO offers (offer_id, application_id, student_id, job_id, package_offered, joining_date, offer_letter_url, status) VALUES
(1, 1, 1, 1, 28.50, '2027-07-01', '/offers/google_offer_aarav_sharma.pdf', 'Accepted'),
(2, 3, 2, 2, 24.00, '2027-07-15', '/offers/microsoft_offer_priya_patel.pdf', 'Accepted');
