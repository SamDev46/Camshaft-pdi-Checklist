-- ==========================================
-- CamTrace v1.0 - Views (Oracle 19c)
-- ==========================================

-- 1. Dashboard View
-- Aggregated statuses of inspections
CREATE OR REPLACE VIEW VW_TCL_CAM_DASHBOARD AS
SELECT 
    STATUS,
    COUNT(INSPECTION_ID) AS TOTAL_INSPECTIONS,
    MAX(STARTED_AT) AS LAST_ACTIVITY
FROM TCL_CAM_INSPECTION
GROUP BY STATUS;

COMMENT ON TABLE VW_TCL_CAM_DASHBOARD IS 'Dashboard aggregated counts by status';


-- 2. Operator History View
-- Details of inspections performed by operators
CREATE OR REPLACE VIEW VW_TCL_CAM_OPERATOR_HISTORY AS
SELECT 
    i.INSPECTION_ID,
    i.PART_NUMBER,
    i.SERIAL_NUMBER,
    i.STATUS,
    i.STARTED_AT,
    i.SUBMITTED_AT,
    u.USER_ID AS OPERATOR_ID,
    u.EMPLOYEE_ID AS OPERATOR_EMPLOYEE_ID,
    u.FULL_NAME AS OPERATOR_NAME
FROM TCL_CAM_INSPECTION i
JOIN TCL_CAM_USER u ON i.OPERATOR_ID = u.USER_ID;

COMMENT ON TABLE VW_TCL_CAM_OPERATOR_HISTORY IS 'History of inspections joined with operator details';


-- 3. Inspection Summary View
-- Summary of all inspections
CREATE OR REPLACE VIEW VW_TCL_CAM_INSPECTION_SUMMARY AS
SELECT 
    INSPECTION_ID,
    PART_NUMBER,
    SERIAL_NUMBER,
    VENDOR_CODE,
    STATUS,
    CURRENT_STEP,
    STARTED_AT,
    SUBMITTED_AT
FROM TCL_CAM_INSPECTION;

COMMENT ON TABLE VW_TCL_CAM_INSPECTION_SUMMARY IS 'Detailed summary view for all inspections';


-- 4. Inspection Monitor View (For Managers)
-- Monitor view containing in-progress and submitted inspections
CREATE OR REPLACE VIEW VW_TCL_CAM_INSPECTION_MONITOR AS
SELECT 
    i.INSPECTION_ID,
    i.PART_NUMBER,
    i.SERIAL_NUMBER,
    i.STATUS,
    i.STARTED_AT,
    i.SUBMITTED_AT,
    u.FULL_NAME AS OPERATOR_NAME
FROM TCL_CAM_INSPECTION i
JOIN TCL_CAM_USER u ON i.OPERATOR_ID = u.USER_ID
ORDER BY i.STARTED_AT DESC;

COMMENT ON TABLE VW_TCL_CAM_INSPECTION_MONITOR IS 'Manager view for monitoring all inspections';
