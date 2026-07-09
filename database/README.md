# CamTrace v1.0 - Database Foundation (Phase 2)

This directory contains the foundational Oracle 19c database scripts for CamTrace v1.0.

## Oracle Version
- **Target Engine**: Oracle Database 19c
- **Compatibility Notes**: All scripts utilize traditional sequences and `BEFORE INSERT` triggers instead of `IDENTITY` columns to satisfy explicit trigger requirements.

## Execution Order
To properly initialize the database without dependency errors, run the scripts exactly in this order:

1. `01_tcl_schema.sql` - Creates sequences, tables, constraints, triggers, indexes, and table/column comments.
2. `02_tcl_views.sql` - Creates lightweight operational views (Dashboard, History, Summary, Monitor).
3. `03_tcl_plsql.sql` - Compiles the reusable audit logging PL/SQL procedure.
4. `04_tcl_seed_data.sql` - Inserts the core operational data (Roles, Users, Checklists).

## Objects Created

### Tables (7)
- `TCL_CAM_ROLE`
- `TCL_CAM_USER`
- `TCL_CAM_CHECKLIST`
- `TCL_CAM_INSPECTION`
- `TCL_CAM_RESPONSE`
- `TCL_CAM_PHOTO`
- `TCL_CAM_AUDIT`

### Views (4)
- `VW_TCL_CAM_DASHBOARD`
- `VW_TCL_CAM_OPERATOR_HISTORY`
- `VW_TCL_CAM_INSPECTION_SUMMARY`
- `VW_TCL_CAM_INSPECTION_MONITOR`

### Procedures (1)
- `PR_TCL_CAM_LOG_AUDIT`

### Sequences & Triggers
- 7 `SEQ_TCL_CAM_*` sequences (one for each table).
- 7 `TRG_TCL_CAM_*_PK` triggers to handle Primary Key auto-increment.

## Verification Queries

After executing all scripts, use the following queries to verify the installation:

```sql
-- 1. Verify Tables Created
SELECT table_name 
FROM user_tables 
ORDER BY table_name;

-- 2. Verify Views Created
SELECT view_name 
FROM user_views;

-- 3. Verify Sequences Created
SELECT sequence_name 
FROM user_sequences;

-- 4. Verify PK Triggers Created
SELECT trigger_name 
FROM user_triggers;

-- 5. Verify No Invalid Objects Exist
SELECT object_name, object_type, status 
FROM user_objects 
WHERE status = 'INVALID';
```
