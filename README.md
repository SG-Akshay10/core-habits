# Core Habits

Core Habits is a personal habit tracker for building routines and tracking progress over time. Sign in with Google, log habits from a daily dashboard, and review streaks and statistics.

## Features

- Create build habits or quit habits, including numeric targets and daily, weekly, or monthly goals.
- Log progress by day, add notes, and review or update past entries in a calendar.
- Track streaks, completion statistics, and monthly progress charts.
- Choose a dashboard layout, reorder or archive habits, and set a theme and week start day.
- Set reminder schedules with web push notifications. Email reminders can be configured as a fallback.
- Install the app as a PWA and queue habit logs while offline for sync when connectivity returns.
- Export and import habit data, and create shareable progress cards.

## Tech stack

- Next.js 16 with React 19 and TypeScript
- PostgreSQL with Prisma (the production setup is designed for Neon)
- Auth.js with Google OAuth
- Tailwind CSS 4

## Local development

### Requirements

- Node.js and npm
- A PostgreSQL database
- A Google OAuth client configured with the redirect URI `http://localhost:3000/api/auth/callback/google`

### Setup

1. Create `app/.env` from [`app/.env.example`](app/.env.example) and fill in the database URLs and Google OAuth credentials. Set `AUTH_SECRET` as well. Push reminders require VAPID keys; email reminders additionally require SMTP settings.
2. Install dependencies and apply the Prisma migrations from the `app` directory:

   ```bash
   cd app
   npm install
   npx prisma generate
   npx prisma migrate dev
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Useful commands

Run these from `app/`:

```bash
npm run dev       # Start the development server
npm run build     # Build for production
npm run start     # Serve the production build
npm run lint      # Run ESLint
npm test          # Run the Vitest suite
```

## Environment variables

See [`app/.env.example`](app/.env.example) for the full list and setup notes. The required local settings are `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, and `AUTH_GOOGLE_SECRET`. Configure `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT` to enable push reminders. Set `CRON_SECRET` when scheduling the reminder endpoint outside Vercel. SMTP settings are optional.

## Project structure

- `app/src/app/` — pages, server actions, and API routes
- `app/src/components/` — dashboard, habit, progress, and settings UI
- `app/src/lib/` — date, streak, goal, statistics, notification, and validation logic
- `app/prisma/` — database schema and migrations