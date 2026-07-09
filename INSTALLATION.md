# Local Development Installation

## Prerequisites
- Node.js 18+
- Python 3.10+
- Oracle 19c Client / Database Access

## 1. Database
Please refer to [DATABASE_SETUP.md](DATABASE_SETUP.md) for instructions on executing the SQL scripts.

## 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Oracle credentials
uvicorn app.main:app --reload
```

## 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.
