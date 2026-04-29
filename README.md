# LaTeX Exerciser

LaTeX Exerciser is a timed quiz web app for practicing LaTeX equation input.

The goal is to improve:

- LaTeX input speed
- Formula pattern recall
- Accuracy under time limits
- Repeated practice across difficulty levels

Production frontend:

```txt
https://latex-exerciser.vercel.app/
```

Current backend runtime:

```txt
Local FastAPI server
http://localhost:8000/api
```

---

## Current Status

This repository is a v0 mock implementation.

The frontend is deployed to Vercel. The backend is intentionally run locally through FastAPI. Data persistence is currently in-memory; PostgreSQL local infrastructure is prepared but not yet used as the application repository.

---

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | Next.js App Router |
| Frontend Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| LaTeX Rendering | KaTeX |
| Toast | sonner |
| Backend | FastAPI |
| Backend Language | Python |
| API Validation | Pydantic |
| Local DB Infrastructure | PostgreSQL via Docker Compose |
| Frontend Hosting | Vercel |

---

## Repository Structure

```txt
.
├── apps
│   ├── api
│   │   ├── app
│   │   │   ├── api
│   │   │   ├── core
│   │   │   ├── repositories
│   │   │   ├── schemas
│   │   │   └── services
│   │   ├── requirements.txt
│   │   └── scripts
│   │       └── smoke_test.py
│   └── web
│       └── src
│           ├── app
│           ├── entities
│           ├── features
│           ├── shared
│           └── widgets
├── docker-compose.yml
├── scripts
│   └── start-local-backend.sh
└── README.md
```

---

## Main Features

### Auth

- Signup
- Login
- Logout
- Current user lookup

### Settings

- Default difficulty range
- Default question time limit
- Strict mode
- Auto-advance flag

### Quiz

- Difficulty range selection
- Generated quiz count
- Timed quiz play
- Live LaTeX preview
- Submit answer
- Reveal answer
- Next question
- Result summary

### Debug

- Quiz database list
- Difficulty filter
- Rendered LaTeX preview per quiz

---

## Main Routes

| Route | Purpose |
| --- | --- |
| `/` | Redirects to login or quiz setup |
| `/signup` | Create mock user |
| `/login` | Login |
| `/quiz/setup` | Configure and start quiz |
| `/quiz/play?sessionId=...` | Play quiz |
| `/quiz/result/:sessionId` | View quiz result |
| `/settings/practice` | Practice settings |
| `/settings/profile` | User profile summary |
| `/quizzes` | Quiz data debug list |

---

## Local Backend Setup

### 1. Create backend env file

Create `apps/api/.env`:

```bash
cp apps/api/.env.example apps/api/.env
```

Recommended local values:

```env
APP_ENV=local
API_TITLE=LaTeX Exerciser API
API_VERSION=0.1.0
CORS_ORIGINS=http://localhost:3000,https://latex-exerciser.vercel.app
DATABASE_URL=postgresql+psycopg://latex_exerciser:latex_exerciser_password@127.0.0.1:5433/latex_exerciser
```

`CORS_ORIGINS` must include the Vercel frontend origin.

Do not add a trailing slash:

```txt
Correct: https://latex-exerciser.vercel.app
Wrong:   https://latex-exerciser.vercel.app/
```

---

### 2. Start local backend

From the repository root:

```bash
./scripts/start-local-backend.sh
```

This script starts:

- Docker PostgreSQL on host port `5433`
- Python virtualenv if needed
- FastAPI on `127.0.0.1:8000`

Backend health check:

```bash
curl -s http://localhost:8000/api/health | python -m json.tool
```

Expected shape:

```json
{
  "status": "ok",
  "environment": "local",
  "databaseConfigured": true,
  "databaseUrl": "postgresql+psycopg://latex_exerciser:***@127.0.0.1:5433/latex_exerciser",
  "databaseReachable": true
}
```

---

## Using the Vercel Frontend with Local Backend

1. Start the backend:

```bash
./scripts/start-local-backend.sh
```

2. Open:

```txt
https://latex-exerciser.vercel.app/
```

3. Signup or login.

The deployed frontend calls:

```txt
http://localhost:8000/api
```

from the browser. Therefore, the local backend must be running on the same machine where the browser is open.

---

## Local Frontend Setup

The Vercel frontend is the primary frontend runtime, but local frontend development is also supported.

### 1. Create frontend env file

Create `apps/web/.env.local`:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Expected value:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

### 2. Install and run

```bash
cd apps/web
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

## Backend Smoke Test

Start backend first:

```bash
./scripts/start-local-backend.sh
```

Then run from the repository root in another terminal:

```bash
python apps/api/scripts/smoke_test.py
```

Expected final output:

```txt
Backend smoke test passed.
```

The smoke test covers:

```txt
/api/health
/api/auth/signup
/api/auth/login
/api/auth/me
/api/settings
/api/quizzes
/api/quiz/sessions
/api/quiz/sessions/{sessionId}
submit / duplicate submit / next / reveal / result
```

---

## Build Verification

### Frontend build

```bash
cd apps/web
npm run build
```

Expected:

```txt
Compiled successfully
```

### Backend compile

```bash
cd apps/api
source .venv/bin/activate
python -m compileall app scripts
```

Expected:

```txt
No compile errors
```

---

## Vercel Configuration

Vercel project settings:

| Field | Value |
| --- | --- |
| Application Preset | Next.js |
| Root Directory | `apps/web` |
| Build Command | default or `npm run build` |
| Output Directory | default |
| Install Command | default or `npm install` |

Environment variable:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

Because the backend is local, the deployed frontend works only when the local FastAPI backend is running on the user machine.

---

## Local PostgreSQL

PostgreSQL is prepared through Docker Compose.

The app still uses the in-memory repository in v0, but the database health check verifies that local PostgreSQL is reachable.

Start database only:

```bash
docker compose up -d postgres
```

Check database container:

```bash
docker compose ps
```

Connect through container:

```bash
docker exec -it latex-exerciser-postgres \
  psql -U latex_exerciser -d latex_exerciser -c "SELECT 1;"
```

Stop database:

```bash
docker compose down
```

Remove local DB volume:

```bash
docker compose down -v
```

---

## v0 Constraints

This version intentionally keeps several constraints:

- Backend data is stored in memory.
- Restarting FastAPI resets users, sessions, settings, and quiz progress.
- PostgreSQL is prepared but not used for persistence yet.
- Authentication is simple token-based mock auth.
- The deployed frontend depends on a local backend.
- Quiz data is seed data.
- `/quizzes` is a debug page, not an admin production page.

---

## Recommended Final Test Flow

1. Start backend:

```bash
./scripts/start-local-backend.sh
```

2. Open Vercel frontend:

```txt
https://latex-exerciser.vercel.app/
```

3. Signup.

4. Open settings:

```txt
/settings/practice
```

5. Change default time limit.

6. Start quiz:

```txt
/quiz/setup
```

7. Confirm timer uses the configured time limit.

8. Submit correct and wrong answers.

9. Reveal an answer.

10. Finish quiz and confirm result page.

11. Run backend smoke test:

```bash
python apps/api/scripts/smoke_test.py
```

---

## Useful Commands

```bash
# Start full local backend runtime
./scripts/start-local-backend.sh

# Backend health
curl -s http://localhost:8000/api/health | python -m json.tool

# Backend smoke test
python apps/api/scripts/smoke_test.py

# Frontend local dev
cd apps/web && npm run dev

# Frontend build
cd apps/web && npm run build

# Backend compile
cd apps/api && source .venv/bin/activate && python -m compileall app scripts
```

---

## License

No license has been selected yet.