-- ============================================================================
-- CampusHire — College Placement and Recruitment Management System
-- Comprehensive Academic SQL Showcase
-- Covers: DDL, DML, DQL, Multi-table Joins, Aggregates, GROUP BY / HAVING,
-- Subqueries, Correlated Subqueries, Transactions, and Query Optimization
-- ============================================================================

USE campushire_db;

-- ============================================================================
-- 1. DATA DEFINITION LANGUAGE (DDL) DEMONSTRATIONS
-- ============================================================================

-- 1.1 ALTER TABLE: Add a column for LinkedIn profile link
ALTER TABLE students 
ADD COLUMN linkedin_url VARCHAR(255) NULL AFTER resume_url;

-- 1.2 ALTER TABLE: Modify column definition to support international contact numbers
ALTER TABLE students 
MODIFY COLUMN phone VARCHAR(25) NULL;

-- 1.3 ALTER TABLE: Add check constraint for valid year
ALTER TABLE students 
ADD CONSTRAINT chk_graduation_range CHECK (graduation_year >= 2020);

-- 1.4 ALTER TABLE: Drop constraint (demonstration)
-- ALTER TABLE students DROP CONSTRAINT chk_graduation_range;

-- ============================================================================
-- 2. DATA MANIPULATION LANGUAGE (DML) DEMONSTRATIONS
-- ============================================================================

-- 2.1 INSERT: Insert a new skill into catalog
INSERT INTO skills (skill_name, category) 
VALUES ('Next.js & Server Components', 'Frontend')
ON DUPLICATE KEY UPDATE category = VALUES(category);

-- 2.2 UPDATE: Update student contact phone and semester
UPDATE students 
SET phone = '+91 9988776655', semester = 8 
WHERE roll_number = '2023CS0101';

-- 2.3 DELETE: Delete expired draft job postings
DELETE FROM job_postings 
WHERE status = 'draft' AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- ============================================================================
-- 3. DATA QUERY LANGUAGE (DQL) & ADVANCED RELATIONAL JOINS
-- ============================================================================

-- 3.1 INNER JOIN: Get eligible applications with student name and job title
SELECT 
    a.application_id,
    s.roll_number,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    s.branch,
    s.cgpa,
    j.title AS job_title,
    c.company_name,
    j.package_lpa,
    a.status,
    a.applied_at
FROM applications a
INNER JOIN students s ON a.student_id = s.student_id
INNER JOIN job_postings j ON a.job_id = j.job_id
INNER JOIN companies c ON j.company_id = c.company_id
ORDER BY j.package_lpa DESC, s.cgpa DESC;

-- 3.2 LEFT JOIN: List all students and their offer details (including unplaced students)
SELECT 
    s.student_id,
    s.roll_number,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    s.branch,
    s.cgpa,
    s.is_placed,
    COALESCE(c.company_name, 'Seeking Placement') AS recruited_by,
    COALESCE(o.package_offered, 0.00) AS package_lpa,
    o.status AS offer_status
FROM students s
LEFT JOIN offers o ON s.student_id = o.student_id
LEFT JOIN job_postings j ON o.job_id = j.job_id
LEFT JOIN companies c ON j.company_id = c.company_id
ORDER BY s.is_placed DESC, s.cgpa DESC;

-- 3.3 RIGHT JOIN: List all registered companies and their posted jobs
SELECT 
    c.company_name,
    c.industry,
    c.location,
    j.title AS job_title,
    j.package_lpa,
    j.status AS posting_status
FROM job_postings j
RIGHT JOIN companies c ON j.company_id = c.company_id
ORDER BY c.company_name;

-- 3.4 MULTI-TABLE JOIN: Candidate interview schedule with recruitment rounds
SELECT 
    i.interview_id,
    CONCAT(s.first_name, ' ', s.last_name) AS candidate_name,
    s.branch,
    c.company_name,
    j.title AS job_title,
    r.round_number,
    r.round_name,
    r.round_type,
    i.scheduled_time,
    i.meeting_link,
    i.status AS interview_status
FROM interviews i
JOIN applications a ON i.application_id = a.application_id
JOIN students s ON a.student_id = s.student_id
JOIN recruitment_rounds r ON i.round_id = r.round_id
JOIN job_postings j ON a.job_id = j.job_id
JOIN companies c ON j.company_id = c.company_id
WHERE i.status = 'Scheduled'
ORDER BY i.scheduled_time ASC;

-- ============================================================================
-- 4. AGGREGATE FUNCTIONS & GROUP BY / HAVING CLAUSES
-- ============================================================================

-- 4.1 Branch-level statistics with COUNT, AVG, MAX, MIN
SELECT 
    s.branch,
    COUNT(s.student_id) AS total_enrolled,
    ROUND(AVG(s.cgpa), 2) AS avg_cgpa,
    MAX(s.cgpa) AS highest_cgpa,
    MIN(s.cgpa) AS lowest_cgpa,
    SUM(CASE WHEN s.is_placed = 1 THEN 1 ELSE 0 END) AS total_placed,
    ROUND((SUM(CASE WHEN s.is_placed = 1 THEN 1 ELSE 0 END) / COUNT(s.student_id)) * 100, 1) AS placement_rate
FROM students s
GROUP BY s.branch
ORDER BY placement_rate DESC;

-- 4.2 Companies offering competitive packages (GROUP BY with HAVING clause)
-- Filter companies whose average package across drives exceeds 15.00 LPA
SELECT 
    c.company_name,
    c.industry,
    COUNT(j.job_id) AS total_drives,
    ROUND(AVG(j.package_lpa), 2) AS average_package,
    MAX(j.package_lpa) AS peak_package
FROM companies c
JOIN job_postings j ON c.company_id = j.company_id
GROUP BY c.company_id, c.company_name, c.industry
HAVING AVG(j.package_lpa) >= 15.00
ORDER BY average_package DESC;

-- 4.3 High demand roles: Drives receiving more than 2 applications (HAVING count > 2)
SELECT 
    j.job_id,
    j.title,
    c.company_name,
    j.package_lpa,
    COUNT(a.application_id) AS total_applications
FROM job_postings j
JOIN companies c ON j.company_id = c.company_id
LEFT JOIN applications a ON j.job_id = a.job_id
GROUP BY j.job_id, j.title, c.company_name, j.package_lpa
HAVING COUNT(a.application_id) >= 2
ORDER BY total_applications DESC;

-- ============================================================================
-- 5. SUBQUERIES AND NESTED QUERIES
-- ============================================================================

-- 5.1 Scalar Subquery: Find students with CGPA greater than the overall college average
SELECT 
    roll_number,
    CONCAT(first_name, ' ', last_name) AS student_name,
    branch,
    cgpa
FROM students
WHERE cgpa > (SELECT AVG(cgpa) FROM students)
ORDER BY cgpa DESC;

-- 5.2 Correlated Subquery: Find students who have applied to every approved job drive
SELECT 
    s.roll_number,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    s.branch
FROM students s
WHERE NOT EXISTS (
    SELECT j.job_id 
    FROM job_postings j 
    WHERE j.status = 'approved'
    AND NOT EXISTS (
        SELECT a.application_id 
        FROM applications a 
        WHERE a.job_id = j.job_id AND a.student_id = s.student_id
    )
);

-- 5.3 Subquery with IN: Students who possess 'Data Structures & Algorithms' skill
SELECT 
    s.roll_number,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    s.branch,
    s.cgpa
FROM students s
WHERE s.student_id IN (
    SELECT ss.student_id 
    FROM student_skills ss 
    JOIN skills sk ON ss.skill_id = sk.skill_id 
    WHERE sk.skill_name = 'Data Structures & Algorithms'
);

-- 5.4 Subquery with EXISTS: Companies that have scheduled at least one technical interview
SELECT 
    c.company_id,
    c.company_name,
    c.industry
FROM companies c
WHERE EXISTS (
    SELECT 1 
    FROM job_postings j 
    JOIN applications a ON j.job_id = a.job_id 
    JOIN interviews i ON a.application_id = i.application_id
    WHERE j.company_id = c.company_id
);

-- ============================================================================
-- 6. ACID TRANSACTION DEMONSTRATION
-- Application submission with status history logging in a single atomic unit
-- ============================================================================
START TRANSACTION;

-- Insert Application
INSERT INTO applications (job_id, student_id, status, notes)
VALUES (1, 6, 'Applied', 'Candidate applied under CSE batch');

-- Capture generated ID
SET @new_app_id = LAST_INSERT_ID();

-- Insert audit history
INSERT INTO application_history (application_id, old_status, new_status, remarks)
VALUES (@new_app_id, NULL, 'Applied', 'Initial transaction commit');

COMMIT;
