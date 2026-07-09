-- ==========================================
-- CamTrace v1.0 - PL/SQL Procedures (Oracle 19c)
-- ==========================================

-- 1. Audit Logging Procedure
-- Standardized procedure to log actions to TCL_CAM_AUDIT table.
CREATE OR REPLACE PROCEDURE PR_TCL_CAM_LOG_AUDIT (
    p_user_id     IN NUMBER,
    p_entity      IN VARCHAR2,
    p_entity_id   IN NUMBER,
    p_action      IN VARCHAR2,
    p_description IN VARCHAR2
) 
IS
BEGIN
    INSERT INTO TCL_CAM_AUDIT (
        USER_ID, 
        ENTITY, 
        ENTITY_ID, 
        ACTION, 
        DESCRIPTION, 
        CREATED_AT
    ) VALUES (
        p_user_id,
        p_entity,
        p_entity_id,
        p_action,
        p_description,
        CURRENT_TIMESTAMP
    );
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END PR_TCL_CAM_LOG_AUDIT;
/
