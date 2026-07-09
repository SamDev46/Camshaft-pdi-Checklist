# Troubleshooting Guide

### Backend won't start
- **Symptom**: `uvicorn` throws a Database Connection Error.
- **Fix**: Verify your `.env` credentials (`DB_USER`, `DB_PASSWORD`, `DB_DSN`). Ensure Oracle is running and accessible on port 1521.

### Port already in use
- **Symptom**: FastAPI fails with `Address already in use`.
- **Fix**: Run `kill -9 $(lsof -t -i:8000)` (Linux/Mac) or use Task Manager to kill the rogue python process.

### Login failed
- **Symptom**: 401 Unauthorized for valid credentials.
- **Fix**: Ensure the `TCL_CAM_USERS` table was seeded (run `04_tcl_seed_data.sql`).

### Photo upload failed
- **Symptom**: Error snackbar "File too large" or "Failed to upload".
- **Fix**: Ensure the file is strictly `< 10MB` and is either `.jpg`, `.jpeg`, or `.png`.

### Build failed
- **Symptom**: `npm run build` fails with unresolved imports.
- **Fix**: Ensure you have run `npm install` to pull down all Vite and React dependencies.
