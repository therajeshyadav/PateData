# Pastebin Lite - Backend

A simple Pastebin-like API that allows users to create text pastes with optional TTL and view limits.

## Project Description

This is the backend API for Pastebin Lite. It provides endpoints to:
- Create pastes with optional time-based expiry (TTL) and view count limits
- Retrieve pastes via API (JSON) or HTML view
- Health check endpoint for monitoring

## Persistence Layer

**Neon PostgreSQL** - A serverless PostgreSQL database that works well with Vercel's serverless functions. The database automatically initializes the required table on first request.

## How to Run Locally

### Prerequisites
- Node.js >= 18
- A Neon PostgreSQL database (or any PostgreSQL instance)

### Setup

1. Clone the repository
2. Navigate to the backend folder:
   ```bash
   cd backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

5. Update `.env` with your Neon database connection string:
   ```
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   BASE_URL=http://localhost:3001
   TEST_MODE=0
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:3001`.

## API Endpoints

### Health Check
```
GET /api/healthz
```
Returns `{ "ok": true }` if the database is accessible.

### Create Paste
```
POST /api/pastes
Content-Type: application/json

{
  "content": "Your text here",
  "ttl_seconds": 60,      // optional
  "max_views": 5          // optional
}
```

### Get Paste (API)
```
GET /api/pastes/:id
```
Returns JSON with paste content, remaining views, and expiry time.

### View Paste (HTML)
```
GET /p/:id
```
Returns HTML page with the paste content.

## Deployment to Vercel

1. Push the code to a Git repository
2. Import the project in Vercel
3. Set the root directory to `backend`
4. Add environment variables:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `TEST_MODE`: Set to `1` to enable deterministic time testing
   - `BASE_URL`: Your deployed URL (e.g., `https://your-app.vercel.app`)

## Design Decisions

1. **Neon PostgreSQL**: Chosen for serverless compatibility and persistence across requests
2. **Atomic view counting**: Uses `UPDATE ... WHERE ... RETURNING` to prevent race conditions
3. **HTML escaping**: All paste content is escaped to prevent XSS attacks
4. **Deterministic testing**: Supports `x-test-now-ms` header when `TEST_MODE=1` for TTL testing
5. **Single serverless function**: All routes handled by one function for simplicity and cold start optimization
