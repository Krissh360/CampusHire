-- ============================================================================
-- CampusHire — College Placement and Recruitment Management System
-- Database Triggers (Automated Audit Trails & Declarative Enforcement)
-- ============================================================================

USE campushire_db;

DELIMITER $$

-- ----------------------------------------------------------------------------
-- 1. TRIGGER: trg_after_application_status_update
-- Automatically captures every state change into application_history
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_after_application_status_update$$

CREATE TRIGGER trg_after_application_status_update
AFTER UPDATE ON applications
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO application_history (
            application_id,
            old_status,
            new_status,
            remarks,
            changed_at
        ) VALUES (
            NEW.application_id,
            OLD.status,
            NEW.status,
            CONCAT('Trigger automated log: transitioned from ', OLD.status, ' to ', NEW.status),
            NOW()
        );
    END IF;
END$$

-- ----------------------------------------------------------------------------
-- 2. TRIGGER: trg_after_offer_status_update
-- Synchronizes students.is_placed boolean when an offer status changes
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_after_offer_status_update$$

CREATE TRIGGER trg_after_offer_status_update
AFTER UPDATE ON offers
FOR EACH ROW
BEGIN
    -- When student accepts an offer, ensure student is placed
    IF NEW.status = 'Accepted' THEN
        UPDATE students
        SET is_placed = TRUE
        WHERE student_id = NEW.student_id;
    END IF;
    
    -- If offer is Revoked or Declined and candidate has no other accepted offers
    IF NEW.status IN ('Declined', 'Revoked') THEN
        IF (SELECT COUNT(*) FROM offers WHERE student_id = NEW.student_id AND status = 'Accepted') = 0 THEN
            UPDATE students
            SET is_placed = FALSE
            WHERE student_id = NEW.student_id;
        END IF;
    END IF;
END$$

-- ----------------------------------------------------------------------------
-- 3. TRIGGER: trg_prevent_application_past_deadline
-- Ensures applications cannot be inserted after job posting deadline
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_prevent_application_past_deadline$$

CREATE TRIGGER trg_prevent_application_past_deadline
BEFORE INSERT ON applications
FOR EACH ROW
BEGIN
    DECLARE v_deadline DATETIME;
    DECLARE v_status VARCHAR(50);

    SELECT deadline, status INTO v_deadline, v_status
    FROM job_postings
    WHERE job_id = NEW.job_id;

    IF v_status != 'approved' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Application Error: Job recruitment drive is not in approved state.';
    END IF;

    IF NOW() > v_deadline THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Application Error: Recruitment drive deadline has passed.';
    END IF;
END$$

-- ----------------------------------------------------------------------------
-- 4. TRIGGER: trg_validate_student_cgpa_bounds
-- Declarative check enforcing valid academic CGPA bounds (0.00 to 10.00)
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_validate_student_cgpa_bounds$$

CREATE TRIGGER trg_validate_student_cgpa_bounds
BEFORE INSERT ON students
FOR EACH ROW
BEGIN
    IF NEW.cgpa < 0.00 OR NEW.cgpa > 10.00 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: CGPA must be strictly between 0.00 and 10.00.';
    END IF;
END$$

DELIMITER ;
