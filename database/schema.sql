-- ============================================================================
-- CampusHire — College Placement and Recruitment Management System
-- Database Definition (DDL) Schema
-- DBMS Project - Relational Schema Implementation
-- ============================================================================

-- Create database if not exists and switch context
CREATE DATABASE IF NOT EXISTS campushire_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campushire_db;

-- ----------------------------------------------------------------------------
-- Drop existing tables in reverse dependency order (Clean Slate)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS offers;
DROP TABLE IF EXISTS interviews;
DROP TABLE IF EXISTS application_history;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS recruitment_rounds;
DROP TABLE IF EXISTS eligibility;
DROP TABLE IF EXISTS job_postings;
DROP TABLE IF EXISTS student_skills;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;

-- ============================================================================
-- 1. USERS TABLE
-- Authentication & Core Authorization Entity
-- ============================================================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'company', 'admin') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_email_format CHECK (email LIKE '%_@__%.__%')
) ENGINE=InnoDB;

-- ============================================================================
-- 2. STUDENTS TABLE
-- Academic Profile, Branch, CGPA, Backlogs, Resume
-- ============================================================================
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    roll_number VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    branch VARCHAR(50) NOT NULL,
    semester INT NOT NULL,
    cgpa DECIMAL(3, 2) NOT NULL,
    graduation_year INT NOT NULL,
    active_backlogs INT DEFAULT 0,
    total_backlogs INT DEFAULT 0,
    resume_url VARCHAR(255),
    is_placed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_student_semester CHECK (semester BETWEEN 1 AND 8),
    CONSTRAINT chk_student_cgpa CHECK (cgpa >= 0.00 AND cgpa <= 10.00),
    CONSTRAINT chk_active_backlogs CHECK (active_backlogs >= 0),
    CONSTRAINT chk_total_backlogs CHECK (total_backlogs >= active_backlogs)
) ENGINE=InnoDB;

-- ============================================================================
-- 3. COMPANIES TABLE
-- Recruiter Entity, Verification Status, HR Contacts
-- ============================================================================
CREATE TABLE companies (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    company_name VARCHAR(100) NOT NULL,
    industry VARCHAR(100),
    website VARCHAR(255),
    description TEXT,
    hr_name VARCHAR(100),
    hr_email VARCHAR(100),
    hr_phone VARCHAR(20),
    location VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_companies_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 4. SKILLS TABLE
-- Master Catalog of Technical and Professional Skills
-- ============================================================================
CREATE TABLE skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(50) DEFAULT 'General'
) ENGINE=InnoDB;

-- ============================================================================
-- 5. STUDENT_SKILLS TABLE (Many-to-Many Bridge)
-- Links Students to Skills with Proficiency Rating
-- ============================================================================
CREATE TABLE student_skills (
    student_id INT NOT NULL,
    skill_id INT NOT NULL,
    proficiency ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Intermediate',
    PRIMARY KEY (student_id, skill_id),
    CONSTRAINT fk_student_skills_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_student_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 6. JOB_POSTINGS TABLE
-- Recruitment Drives and Open Roles Posted by Companies
-- ============================================================================
CREATE TABLE job_postings (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    role_type VARCHAR(50) DEFAULT 'Full-time',
    package_lpa DECIMAL(5, 2) NOT NULL,
    location VARCHAR(100) NOT NULL,
    deadline DATETIME NOT NULL,
    status ENUM('draft', 'pending_approval', 'approved', 'rejected', 'closed') DEFAULT 'pending_approval',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_jobs_company FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
    CONSTRAINT chk_job_package CHECK (package_lpa > 0.00)
) ENGINE=InnoDB;

-- ============================================================================
-- 7. ELIGIBILITY TABLE (1-to-1 with Job_Postings)
-- Criteria Requirements (CGPA cutoff, allowed branches, backlogs, batch year)
-- ============================================================================
CREATE TABLE eligibility (
    eligibility_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL UNIQUE,
    min_cgpa DECIMAL(3, 2) DEFAULT 6.00,
    max_active_backlogs INT DEFAULT 0,
    allowed_branches TEXT NOT NULL, -- Comma-separated (e.g. 'CSE,IT,ECE') or '*'
    graduation_year INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_eligibility_job FOREIGN KEY (job_id) REFERENCES job_postings(job_id) ON DELETE CASCADE,
    CONSTRAINT chk_eligibility_cgpa CHECK (min_cgpa >= 0.00 AND min_cgpa <= 10.00),
    CONSTRAINT chk_eligibility_backlogs CHECK (max_active_backlogs >= 0)
) ENGINE=InnoDB;

-- ============================================================================
-- 8. RECRUITMENT_ROUNDS TABLE
-- Interview stages (e.g., Round 1: OA, Round 2: Tech, Round 3: HR)
-- ============================================================================
CREATE TABLE recruitment_rounds (
    round_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    round_number INT NOT NULL,
    round_name VARCHAR(100) NOT NULL,
    round_type ENUM('Online Test', 'Technical', 'HR', 'Group Discussion', 'Other') DEFAULT 'Technical',
    description TEXT,
    CONSTRAINT fk_rounds_job FOREIGN KEY (job_id) REFERENCES job_postings(job_id) ON DELETE CASCADE,
    CONSTRAINT uk_job_round_number UNIQUE (job_id, round_number),
    CONSTRAINT chk_round_number CHECK (round_number > 0)
) ENGINE=InnoDB;

-- ============================================================================
-- 9. APPLICATIONS TABLE
-- Student Job Applications with Status Workflow
-- ============================================================================
CREATE TABLE applications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected') DEFAULT 'Applied',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    CONSTRAINT fk_applications_job FOREIGN KEY (job_id) REFERENCES job_postings(job_id) ON DELETE CASCADE,
    CONSTRAINT fk_applications_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT uk_job_student_application UNIQUE (job_id, student_id)
) ENGINE=InnoDB;

-- ============================================================================
-- 10. APPLICATION_HISTORY TABLE
-- Audit Log for Status Changes (Populated by Triggers or Operations)
-- ============================================================================
CREATE TABLE application_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    remarks VARCHAR(255),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_app_history_app FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 11. INTERVIEWS TABLE
-- Scheduled Candidate Interviews per Round
-- ============================================================================
CREATE TABLE interviews (
    interview_id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    round_id INT NOT NULL,
    scheduled_time DATETIME NOT NULL,
    meeting_link VARCHAR(255),
    location VARCHAR(100),
    feedback TEXT,
    status ENUM('Scheduled', 'Completed', 'Cancelled', 'Absent') DEFAULT 'Scheduled',
    result ENUM('Pending', 'Passed', 'Failed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_interviews_application FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE,
    CONSTRAINT fk_interviews_round FOREIGN KEY (round_id) REFERENCES recruitment_rounds(round_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 12. OFFERS TABLE
-- Final Selection, Offer Package and Acceptance Tracking
-- ============================================================================
CREATE TABLE offers (
    offer_id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL UNIQUE,
    student_id INT NOT NULL,
    job_id INT NOT NULL,
    package_offered DECIMAL(5, 2) NOT NULL,
    joining_date DATE,
    offer_letter_url VARCHAR(255),
    status ENUM('Offered', 'Accepted', 'Declined', 'Revoked') DEFAULT 'Offered',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_offers_application FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE,
    CONSTRAINT fk_offers_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_offers_job FOREIGN KEY (job_id) REFERENCES job_postings(job_id) ON DELETE CASCADE,
    CONSTRAINT chk_offer_package CHECK (package_offered > 0.00)
) ENGINE=InnoDB;
