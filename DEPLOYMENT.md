# Production Deployment

## Environment Variables (.env)
You must define these securely on the production backend server:
- `DB_USER`: Oracle username
- `DB_PASSWORD`: Oracle password
- `DB_DSN`: Oracle Connection String (e.g., `hostname:1521/SERVICE`)
- `SECRET_KEY`: A cryptographically secure random string for JWT signing
- `ALGORITHM`: HS256
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Typically 480 (8 hours)
- `CORS_ORIGINS`: JSON array of allowed origins (e.g., `["https://camtrace.company.internal"]`)

## Oracle Database
Execute the `database/` scripts sequentially in your production environment as a privileged user.

## Backend (FastAPI)
Deploy the FastAPI application using `uvicorn` and a process manager like systemd.
```bash
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Frontend (React/Vite)
Build the static bundle:
```bash
npm run build
```
Serve the `dist/` folder using a high-performance web server like NGINX or Apache. Ensure standard SPA routing rules are applied (redirecting 404s to `index.html`).
