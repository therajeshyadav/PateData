# Pastebin Lite

A simple Pastebin-like application where users can create text pastes and share links to view them. Supports optional TTL (time-to-live) and view count limits.

## Project Structure

```
├── backend/          # Node.js API (Vercel serverless functions)
└── quick-paste-main/ # React frontend (Vite + TypeScript)
```

## Persistence Layer

**Neon PostgreSQL** - A serverless PostgreSQL database that provides persistent storage across serverless function invocations. The database schema is automatically initialized on first request.

## Running Locally

### Prerequisites
- Node.js >= 18
- A Neon PostgreSQL database (get one free at https://neon.tech)

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your DATABASE_URL
```

Required environment variables:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `TEST_MODE` - Set to `1` to enable deterministic time testing (optional)
- `BASE_URL` - Your deployed URL (optional, auto-detected)

Start the backend:
```bash
npm run dev
```

Backend runs on http://localhost:3001

### Frontend Setup

```bash
cd quick-paste-main
npm install

# Optional: Create .env for API URL
echo "VITE_API_URL=http://localhost:3001" > .env
```

Start the frontend:
```bash
npm run dev
```

Frontend runs on http://localhost:5173

## Deployment to Vercel

### Backend Deployment

1. Push code to GitHub
2. Import the `backend` folder in Vercel
3. Set environment variables:
   - `DATABASE_URL`: Your Neon connection string
   - `TEST_MODE`: `1` (for automated testing)
   - `BASE_URL`: Your deployed URL

### Frontend Deployment

1. Import the `quick-paste-main` folder in Vercel
2. Set `VITE_API_URL` to your backend URL

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/healthz` | Health check |
| POST | `/api/pastes` | Create a paste |
| GET | `/api/pastes/:id` | Get paste (JSON) |
| GET | `/p/:id` | View paste (HTML) |

## Design Decisions

1. **Neon PostgreSQL**: Chosen for serverless compatibility - persists data across cold starts
2. **Atomic view counting**: Uses `UPDATE ... WHERE ... RETURNING` to prevent race conditions under concurrent load
3. **XSS Prevention**: All paste content is HTML-escaped before rendering
4. **Deterministic testing**: Supports `x-test-now-ms` header when `TEST_MODE=1`
5. **No global mutable state**: Each request creates a fresh database connection via Neon's serverless driver
