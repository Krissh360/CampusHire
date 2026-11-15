-- ============================================================================
-- CampusHire — College Placement and Recruitment Management System
-- Database Views (SQL Abstractions & Analytics Views)
-- ============================================================================

USE campushire_db;

-- ----------------------------------------------------------------------------
-- 1. OVERALL PLACEMENT KPIS VIEW
-- Provides consolidated institutional statistics for executive dashboards
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_overall_placement_kpis AS
SELECT 
    COUNT(DISTINCT s.student_id) AS total_students,
    SUM(CASE WHEN s.is_placed = 1 THEN 1 ELSE 0 END) AS placed_students,
    SUM(CASE WHEN s.is_placed = 0 THEN 1 ELSE 0 END) AS unplaced_students,
    ROUND((SUM(CASE WHEN s.is_placed = 1 THEN 1 ELSE 0 END) / COUNT(DISTINCT s.student_id)) * 100, 2) AS placement_percentage,
    (SELECT COUNT(*) FROM companies WHERE is_verified = 1) AS verified_companies,
    (SELECT COUNT(*) FROM job_postings WHERE status = 'approved') AS active_job_drives,
    (SELECT COUNT(*) FROM applications) AS total_applications_submitted,
    ROUND(AVG(o.package_offered), 2) AS average_package_lpa,
    ROUND(MAX(o.package_offered), 2) AS highest_package_lpa,
    ROUND(MIN(o.package_offered), 2) AS minimum_package_lpa
FROM students s
LEFT JOIN offers o ON s.student_id = o.student_id;

-- ----------------------------------------------------------------------------
-- 2. BRANCH-WISE PLACEMENT BREAKDOWN VIEW
-- Aggregates performance by engineering branch using GROUP BY and aggregates
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_branch_wise_placements AS
SELECT 
    s.branch,
    COUNT(s.student_id) AS total_students,
    SUM(CASE WHEN s.is_placed = 1 THEN 1 ELSE 0 END) AS placed_count,
    SUM(CASE WHEN s.is_placed = 0 THEN 1 ELSE 0 END) AS unplaced_count,
    ROUND((SUM(CASE WHEN s.is_placed = 1 THEN 1 ELSE 0 END) / COUNT(s.student_id)) * 100, 2) AS placement_rate_percent,
    ROUND(AVG(s.cgpa), 2) AS average_branch_cgpa,
    ROUND(AVG(o.package_offered), 2) AS average_branch_ctc_lpa,
    ROUND(MAX(o.package_offered), 2) AS highest_branch_ctc_lpa
FROM students s
LEFT JOIN offers o ON s.student_id = o.student_id
GROUP BY s.branch;

-- ----------------------------------------------------------------------------
-- 3. COMPANY DRIVE PERFORMANCE ANALYTICS VIEW
-- Summarizes conversion funnel per recruitment partner
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_company_drive_analytics AS
SELECT 
    c.company_id,
    c.company_name,
    c.industry,
    c.location,
    COUNT(DISTINCT j.job_id) AS total_drives_posted,
    COUNT(DISTINCT a.application_id) AS total_applications_received,
    SUM(CASE WHEN a.status = 'Shortlisted' THEN 1 ELSE 0 END) AS shortlisted_count,
    SUM(CASE WHEN a.status = 'Interview Scheduled' THEN 1 ELSE 0 END) AS interviews_count,
    SUM(CASE WHEN a.status = 'Selected' THEN 1 ELSE 0 END) AS offers_made_count,
    ROUND(AVG(j.package_lpa), 2) AS average_package_lpa
FROM companies c
LEFT JOIN job_postings j ON c.company_id = j.company_id
LEFT JOIN applications a ON j.job_id = a.job_id
GROUP BY c.company_id, c.company_name, c.industry, c.location;

-- ----------------------------------------------------------------------------
-- 4. STUDENT COMPREHENSIVE STATUS MASTER VIEW
-- Master relation for student academic info, applications, and offer records
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_student_comprehensive_status AS
SELECT 
    s.student_id,
    s.roll_number,
    CONCAT(s.first_name, ' ', s.last_name) AS full_name,
    u.email,
    s.branch,
    s.semester,
    s.cgpa,
    s.active_backlogs,
    s.graduation_year,
    s.is_placed,
    a.application_id,
    a.status AS application_status,
    a.applied_at,
    j.title AS job_title,
    c.company_name,
    o.package_offered,
    o.status AS offer_status
FROM students s
JOIN users u ON s.user_id = u.user_id
LEFT JOIN applications a ON s.student_id = a.student_id
LEFT JOIN job_postings j ON a.job_id = j.job_id
LEFT JOIN companies c ON j.company_id = c.company_id
LEFT JOIN offers o ON a.application_id = o.application_id;

-- ----------------------------------------------------------------------------
-- 5. UPCOMING INTERVIEWS CALENDAR VIEW
-- Schedule timeline joining interviews, students, jobs, and rounds
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_upcoming_interviews_calendar AS
SELECT 
    i.interview_id,
    i.scheduled_time,
    i.status AS interview_status,
    i.meeting_link,
    i.location AS venue,
    r.round_number,
    r.round_name,
    r.round_type,
    j.title AS job_title,
    c.company_name,
    s.roll_number,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    s.branch,
    s.phone AS student_phone
FROM interviews i
JOIN applications a ON i.application_id = a.application_id
JOIN students s ON a.student_id = s.student_id
JOIN recruitment_rounds r ON i.round_id = r.round_id
JOIN job_postings j ON a.job_id = j.job_id
JOIN companies c ON j.company_id = c.company_id
ORDER BY i.scheduled_time ASC;
