-- ==========================================
-- CamTrace v1.0 - Seed Data (Oracle 19c)
-- ==========================================

-- ----------------------------------------------------------------------------
-- 1. Seed Roles
-- ----------------------------------------------------------------------------
INSERT INTO TCL_CAM_ROLE (ROLE_NAME, DESCRIPTION) VALUES ('OPERATOR', 'Camshaft Inspection Operator');
INSERT INTO TCL_CAM_ROLE (ROLE_NAME, DESCRIPTION) VALUES ('MANAGER', 'Inspection Manager / Supervisor');
INSERT INTO TCL_CAM_ROLE (ROLE_NAME, DESCRIPTION) VALUES ('ADMIN', 'System Administrator');
COMMIT;

-- ----------------------------------------------------------------------------
-- 2. Seed Users
-- Note: Passwords are in plain text as per company policy.
-- Note: We retrieve the ROLE_ID dynamically to ensure referential integrity.
-- ----------------------------------------------------------------------------
INSERT INTO TCL_CAM_USER (EMPLOYEE_ID, FULL_NAME, PASSWORD, ROLE_ID, IS_ACTIVE) 
VALUES (
    'operator1', 
    'John Operator', 
    'Cummins@123', 
    (SELECT ROLE_ID FROM TCL_CAM_ROLE WHERE ROLE_NAME = 'OPERATOR'), 
    1
);

INSERT INTO TCL_CAM_USER (EMPLOYEE_ID, FULL_NAME, PASSWORD, ROLE_ID, IS_ACTIVE) 
VALUES (
    'manager1', 
    'Jane Manager', 
    'Cummins@123', 
    (SELECT ROLE_ID FROM TCL_CAM_ROLE WHERE ROLE_NAME = 'MANAGER'), 
    1
);

INSERT INTO TCL_CAM_USER (EMPLOYEE_ID, FULL_NAME, PASSWORD, ROLE_ID, IS_ACTIVE) 
VALUES (
    'admin1', 
    'System Admin', 
    'Cummins@123', 
    (SELECT ROLE_ID FROM TCL_CAM_ROLE WHERE ROLE_NAME = 'ADMIN'), 
    1
);
COMMIT;

-- ----------------------------------------------------------------------------
-- 3. Seed Checklist
-- 7 production questions with SEQUENCE_NO to dictate ordering.
-- All questions set to PHOTO_REQUIRED = 1 as per current business rules.
-- ----------------------------------------------------------------------------
INSERT INTO TCL_CAM_CHECKLIST (QUESTION, SEQUENCE_NO, PHOTO_REQUIRED, IS_ACTIVE, CREATED_BY_USER_ID) 
VALUES (
    'Verify no visual defects on camshaft surface (cracks, scratches, or burrs).', 
    1, 
    1, 
    1, 
    (SELECT USER_ID FROM TCL_CAM_USER WHERE EMPLOYEE_ID = 'manager1')
);

INSERT INTO TCL_CAM_CHECKLIST (QUESTION, SEQUENCE_NO, PHOTO_REQUIRED, IS_ACTIVE, CREATED_BY_USER_ID) 
VALUES (
    'Measure and confirm primary journal diameter is within tolerance.', 
    2, 
    1, 
    1, 
    (SELECT USER_ID FROM TCL_CAM_USER WHERE EMPLOYEE_ID = 'manager1')
);

INSERT INTO TCL_CAM_CHECKLIST (QUESTION, SEQUENCE_NO, PHOTO_REQUIRED, IS_ACTIVE, CREATED_BY_USER_ID) 
VALUES (
    'Check alignment of keyway and ensure proper orientation.', 
    3, 
    1, 
    1, 
    (SELECT USER_ID FROM TCL_CAM_USER WHERE EMPLOYEE_ID = 'manager1')
);

INSERT INTO TCL_CAM_CHECKLIST (QUESTION, SEQUENCE_NO, PHOTO_REQUIRED, IS_ACTIVE, CREATED_BY_USER_ID) 
VALUES (
    'Inspect oil holes for blockages or debris.', 
    4, 
    1, 
    1, 
    (SELECT USER_ID FROM TCL_CAM_USER WHERE EMPLOYEE_ID = 'manager1')
);

INSERT INTO TCL_CAM_CHECKLIST (QUESTION, SEQUENCE_NO, PHOTO_REQUIRED, IS_ACTIVE, CREATED_BY_USER_ID) 
VALUES (
    'Verify hardening depth meets specification on lobe surfaces.', 
    5, 
    1, 
    1, 
    (SELECT USER_ID FROM TCL_CAM_USER WHERE EMPLOYEE_ID = 'manager1')
);

INSERT INTO TCL_CAM_CHECKLIST (QUESTION, SEQUENCE_NO, PHOTO_REQUIRED, IS_ACTIVE, CREATED_BY_USER_ID) 
VALUES (
    'Check overall length and runout dimensions.', 
    6, 
    1, 
    1, 
    (SELECT USER_ID FROM TCL_CAM_USER WHERE EMPLOYEE_ID = 'manager1')
);

INSERT INTO TCL_CAM_CHECKLIST (QUESTION, SEQUENCE_NO, PHOTO_REQUIRED, IS_ACTIVE, CREATED_BY_USER_ID) 
VALUES (
    'Confirm part marking matches vendor code and serial number.', 
    7, 
    1, 
    1, 
    (SELECT USER_ID FROM TCL_CAM_USER WHERE EMPLOYEE_ID = 'manager1')
);
COMMIT;
