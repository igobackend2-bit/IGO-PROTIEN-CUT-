# IGo Academy LMS

A 100% custom Learning Management System for **IGo Academy** (Chennai, Tamil Nadu — TNSDC + MSME recognised). Trainers create courses, upload videos, run quizzes and grade assignments; students enroll, watch lectures, take assessments and earn auto-generated, QR-verified PDF certificates.

> First time here? Follow [`SETUP.md`](SETUP.md) for the full local setup walkthrough (env vars, Supabase buckets, migrations, seeding). This README covers architecture and day-to-day commands.

## Tech stack

| Layer | Technology |
|---|---|
| API server | Node.js 20 + Express |
| Database | PostgreSQL (Supabase), Knex for migrations/queries |
| Sessions | Redis (Upstash cloud) + JWT |
| File/video storage | Supabase Storage (private buckets) |
| Web client | React 18 + Vite + Tailwind CSS, Zustand, TanStack Query |
| Mobile | Flutter (Riverpod, go_router, Supabase, Firebase) — early scaffold, see `mobile/` |
| Payments | Cashfree |
| Certificates | Puppeteer (PDF) + QR code |
| Email | Nodemailer (SMTP) |
| Realtime | Socket.io (planned: live classes/attendance) |
| Cron | node-cron (daily enrollment-expiry checks) |

## Run it

\```bash
cd server
PUPPETEER_SKIP_DOWNLOAD=true npm install
cd ../client
npm install
\```

From the repo root:

\```bash
npm run dev            # runs API + client together
npm run dev:server     # http://localhost:5000
npm run dev:client     # http://localhost:3000
\```

Windows shortcuts: `RUN-SERVER.bat`, `RUN-CLIENT.bat`, or `START-PLATFORM.bat` for both.

## Database

\```bash
npm run migrate
npm run migrate:rollback
npm run seed
\```

Copy/create `.env` in `server/` — see [`SETUP.md`](SETUP.md) for the full variable list (Supabase, Upstash, SMTP, Cashfree, JWT secret). The DB connects through Supabase's **session pooler**, not the direct host, since the direct host is IPv6-only.

## Building & testing

\```bash
npm run build          # full production build
npm run build:client   # client only
cd server && npm test  # Jest + Supertest
\```

## Deployment

- **Vercel** (root `vercel.json`) — client built to `client/dist`, API as a serverless function via `api/index.js`, plus a daily cron for enrollment expiry.
- **Self-hosted / EC2** (`infra/`) — `infra/github-actions/deploy.yml` tests on every push, then SSHes into staging on `main`, migrates, and restarts under `pm2`. `infra/nginx/igo-platform.conf` handles TLS, `/api` and `/socket.io` proxying, SPA fallback, and rate limiting.

Two Dockerfiles: root `Dockerfile` builds only the client (`nginx:alpine`); `server/Dockerfile` is Debian-based (Puppeteer needs glibc) and runs the API on port 5000.

## Roadmap

Phase 2 — live classes (WebRTC/MediaSoup), real-time attendance (Socket.io), enhanced certificates. Phase 3 — mobile app for Android/iOS. `mobile/` is currently just the Flutter scaffold, no built features yet.
