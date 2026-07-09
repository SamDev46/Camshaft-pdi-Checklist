# Project Structure

## Backend
```
backend/
├── app/
│   ├── api/          # Routers and Dependencies (v1)
│   ├── core/         # Config, Security, Logger
│   ├── db/           # Session setup and Base model
│   ├── models/       # SQLAlchemy ORM Models
│   ├── schemas/      # Pydantic validation schemas
│   ├── services/     # Core Business Logic (Operator, Manager, Admin)
│   └── main.py       # FastAPI Entrypoint and Exception Handlers
```

## Frontend
```
frontend/
├── src/
│   ├── api/          # Axios interceptors and fetch functions
│   ├── components/   # Reusable UI (EmptyState, ErrorState, TableSkeleton)
│   ├── context/      # AuthContext, SnackbarContext
│   ├── layouts/      # NavigationShell (Sidebar, Header)
│   ├── pages/        # Route components segmented by role (Operator, Manager, Admin)
│   └── routes/       # React.lazy and Suspense routing (AppRoutes.jsx)
```
