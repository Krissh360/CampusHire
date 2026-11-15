-- ============================================================================
-- CampusHire — College Placement and Recruitment Management System
-- Performance Indexes & Query Optimization
-- ============================================================================

USE campushire_db;

-- 1. Users Lookup Indexes
CREATE INDEX idx_users_role_active ON users(role, is_active);

-- 2. Students Filter & Sorting Indexes
CREATE INDEX idx_students_branch_cgpa ON students(branch, cgpa DESC);
CREATE INDEX idx_students_grad_year ON students(graduation_year);
CREATE INDEX idx_students_is_placed ON students(is_placed);
CREATE INDEX idx_students_roll_number ON students(roll_number);

-- 3. Companies Status Index
CREATE INDEX idx_companies_verified ON companies(is_verified);
CREATE INDEX idx_companies_name ON companies(company_name);

-- 4. Job Postings Search & Status Indexes
CREATE INDEX idx_jobs_status_deadline ON job_postings(status, deadline);
CREATE INDEX idx_jobs_company_status ON job_postings(company_id, status);
CREATE INDEX idx_jobs_package ON job_postings(package_lpa DESC);

-- 5. Eligibility Filter Indexes
CREATE INDEX idx_eligibility_criteria ON eligibility(min_cgpa, max_active_backlogs, graduation_year);

-- 6. Applications Pipeline Indexes
CREATE INDEX idx_apps_job_status ON applications(job_id, status);
CREATE INDEX idx_apps_student_status ON applications(student_id, status);
CREATE INDEX idx_apps_applied_at ON applications(applied_at DESC);

-- 7. Application History Lookup Index
CREATE INDEX idx_app_history_app_id ON application_history(application_id, changed_at DESC);

-- 8. Interviews Schedule Indexes
CREATE INDEX idx_interviews_schedule ON interviews(scheduled_time ASC, status);
CREATE INDEX idx_interviews_app_round ON interviews(application_id, round_id);

-- 9. Offers Tracking Indexes
CREATE INDEX idx_offers_student_status ON offers(student_id, status);
CREATE INDEX idx_offers_job_package ON offers(job_id, package_offered DESC);

-- 10. Student Skills Lookup Index
CREATE INDEX idx_student_skills_skill ON student_skills(skill_id, proficiency);
