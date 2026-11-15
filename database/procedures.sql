-- ============================================================================
-- CampusHire — College Placement and Recruitment Management System
-- Stored Procedures (Transactions, Eligibility Evaluation, Business Logic)
-- ============================================================================

USE campushire_db;

DELIMITER $$

-- ----------------------------------------------------------------------------
-- 1. STORED PROCEDURE: sp_apply_job_with_eligibility_check
-- Validates deadline, duplicate prevention, and academic eligibility inside an ACID transaction
-- ----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_apply_job_with_eligibility_check$$

CREATE PROCEDURE sp_apply_job_with_eligibility_check(
    IN p_job_id INT,
    IN p_student_id INT,
    IN p_notes TEXT,
    OUT p_status_code INT,
    OUT p_message VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_deadline DATETIME;
    DECLARE v_job_status VARCHAR(50);
    DECLARE v_min_cgpa DECIMAL(3, 2);
    DECLARE v_max_backlogs INT;
    DECLARE v_allowed_branches TEXT;
    DECLARE v_grad_year INT;
    
    DECLARE v_student_cgpa DECIMAL(3, 2);
    DECLARE v_student_backlogs INT;
    DECLARE v_student_branch VARCHAR(50);
    DECLARE v_student_year INT;
    
    DECLARE v_existing_count INT DEFAULT 0;
    
    -- Error handler for transactions
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_code = 500;
        SET p_message = 'Internal SQL Transaction Error. Rolled back.';
    END;

    START TRANSACTION;

    -- 1. Check if job exists and is approved
    SELECT deadline, status INTO v_deadline, v_job_status
    FROM job_postings
    WHERE job_id = p_job_id;

    IF v_job_status IS NULL THEN
        SET p_status_code = 404;
        SET p_message = 'Job posting does not exist.';
        ROLLBACK;
        LEAVE proc_label;
    END IF;

    IF v_job_status != 'approved' THEN
        SET p_status_code = 400;
        SET p_message = 'This job drive is not currently approved for applications.';
        ROLLBACK;
        LEAVE proc_label;
    END IF;

    -- 2. Check deadline
    IF NOW() > v_deadline THEN
        SET p_status_code = 400;
        SET p_message = 'Application deadline has expired for this recruitment drive.';
        ROLLBACK;
        LEAVE proc_label;
    END IF;

    -- 3. Check duplicate application
    SELECT COUNT(*) INTO v_existing_count
    FROM applications
    WHERE job_id = p_job_id AND student_id = p_student_id;

    IF v_existing_count > 0 THEN
        SET p_status_code = 409;
        SET p_message = 'Duplicate application: You have already applied for this role.';
        ROLLBACK;
        LEAVE proc_label;
    END IF;

    -- 4. Retrieve student criteria
    SELECT cgpa, active_backlogs, branch, graduation_year
    INTO v_student_cgpa, v_student_backlogs, v_student_branch, v_student_year
    FROM students
    WHERE student_id = p_student_id;

    -- 5. Retrieve job eligibility criteria
    SELECT min_cgpa, max_active_backlogs, allowed_branches, graduation_year
    INTO v_min_cgpa, v_max_backlogs, v_allowed_branches, v_grad_year
    FROM eligibility
    WHERE job_id = p_job_id;

    -- 6. Evaluate criteria
    IF v_student_cgpa < v_min_cgpa THEN
        SET p_status_code = 403;
        SET p_message = CONCAT('Ineligible: CGPA cutoff is ', v_min_cgpa, ' (Your CGPA: ', v_student_cgpa, ')');
        ROLLBACK;
        LEAVE proc_label;
    END IF;

    IF v_student_backlogs > v_max_backlogs THEN
        SET p_status_code = 403;
        SET p_message = CONCAT('Ineligible: Max backlogs allowed is ', v_max_backlogs, ' (You have: ', v_student_backlogs, ')');
        ROLLBACK;
        LEAVE proc_label;
    END IF;

    IF v_grad_year IS NOT NULL AND v_student_year != v_grad_year THEN
        SET p_status_code = 403;
        SET p_message = CONCAT('Ineligible: Target batch year is ', v_grad_year);
        ROLLBACK;
        LEAVE proc_label;
    END IF;

    -- Branch check
    IF v_allowed_branches != '*' AND FIND_IN_SET(v_student_branch, v_allowed_branches) = 0 THEN
        SET p_status_code = 403;
        SET p_message = CONCAT('Ineligible: Allowed branches are [', v_allowed_branches, ']');
        ROLLBACK;
        LEAVE proc_label;
    END IF;

    -- 7. Insert application
    INSERT INTO applications (job_id, student_id, status, notes)
    VALUES (p_job_id, p_student_id, 'Applied', p_notes);

    -- 8. Record audit log
    INSERT INTO application_history (application_id, old_status, new_status, remarks)
    VALUES (LAST_INSERT_ID(), NULL, 'Applied', 'Candidate completed application via stored procedure');

    COMMIT;
    SET p_status_code = 201;
    SET p_message = 'Application submitted successfully!';
END$$

-- ----------------------------------------------------------------------------
-- 2. STORED PROCEDURE: sp_update_application_status_and_offer
-- Updates application workflow state, writes history, and conditionally triggers offers
-- ----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_update_application_status_and_offer$$

CREATE PROCEDURE sp_update_application_status_and_offer(
    IN p_application_id INT,
    IN p_new_status VARCHAR(50),
    IN p_remarks VARCHAR(255),
    IN p_package_offered DECIMAL(5, 2),
    OUT p_success BOOLEAN
)
BEGIN
    DECLARE v_old_status VARCHAR(50);
    DECLARE v_student_id INT;
    DECLARE v_job_id INT;
    DECLARE v_default_package DECIMAL(5, 2);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_success = FALSE;
    END;

    START TRANSACTION;

    SELECT a.status, a.student_id, a.job_id, j.package_lpa
    INTO v_old_status, v_student_id, v_job_id, v_default_package
    FROM applications a
    JOIN job_postings j ON a.job_id = j.job_id
    WHERE a.application_id = p_application_id;

    -- Update application status
    UPDATE applications
    SET status = p_new_status
    WHERE application_id = p_application_id;

    -- Write history audit
    INSERT INTO application_history (application_id, old_status, new_status, remarks)
    VALUES (p_application_id, v_old_status, p_new_status, p_remarks);

    -- If Selected, create Offer record and mark student placed
    IF p_new_status = 'Selected' THEN
        INSERT INTO offers (application_id, student_id, job_id, package_offered, status)
        VALUES (
            p_application_id,
            v_student_id,
            v_job_id,
            COALESCE(p_package_offered, v_default_package),
            'Offered'
        )
        ON DUPLICATE KEY UPDATE 
            package_offered = COALESCE(p_package_offered, v_default_package),
            status = 'Offered';

        UPDATE students
        SET is_placed = TRUE
        WHERE student_id = v_student_id;
    END IF;

    COMMIT;
    SET p_success = TRUE;
END$$

-- ----------------------------------------------------------------------------
-- 3. STORED PROCEDURE: sp_get_branch_placement_summary
-- Generates aggregate placement metrics for a given batch year
-- ----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_get_branch_placement_summary$$

CREATE PROCEDURE sp_get_branch_placement_summary(
    IN p_batch_year INT
)
BEGIN
    SELECT 
        s.branch,
        COUNT(s.student_id) AS total_enrolled,
        SUM(CASE WHEN s.is_placed = 1 THEN 1 ELSE 0 END) AS total_placed,
        ROUND((SUM(CASE WHEN s.is_placed = 1 THEN 1 ELSE 0 END) / COUNT(s.student_id)) * 100, 2) AS placement_percentage,
        ROUND(AVG(o.package_offered), 2) AS average_ctc_lpa,
        ROUND(MAX(o.package_offered), 2) AS peak_ctc_lpa
    FROM students s
    LEFT JOIN offers o ON s.student_id = o.student_id
    WHERE (p_batch_year IS NULL OR s.graduation_year = p_batch_year)
    GROUP BY s.branch
    ORDER BY placement_percentage DESC;
END$$

DELIMITER ;
