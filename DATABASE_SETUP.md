# Oracle Database Setup

All initialization scripts are located in the `database/` directory. They must be executed exactly in this order:

1. **`01_tcl_schema.sql`**
   - Creates `TCL_CAM_ROLE`, `TCL_CAM_USER`, `TCL_CAM_CHECKLIST`, `TCL_CAM_INSPECTION`, `TCL_CAM_RESPONSE`, `TCL_CAM_PHOTO`, and `TCL_CAM_AUDIT`.
   - Defines primary keys, foreign keys, constraints, indexes, and auto-increment triggers.

2. **`02_tcl_views.sql`**
   - Creates the `VW_TCL_CAM_INSPECTION_MONITOR` view for Manager and Admin dashboards.

3. **`03_tcl_plsql.sql`**
   - Creates the audit logging PL/SQL procedure `PR_TCL_CAM_LOG_AUDIT`.

4. **`04_tcl_seed_data.sql`**
   - Inserts the 3 core Roles (ADMIN, MANAGER, OPERATOR).
   - Inserts 3 default users (`admin1`, `manager1`, `operator1`).
   - Seeds the default 7-step checklist.
