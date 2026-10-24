# Timesheets

Turns Google Calendar events into billable hours. Sign in with Google, pick a date range, and see hours per category and per organizer, then copy the table into a spreadsheet or export a CSV.

Nothing is stored on a server. Events are fetched on demand, and settings are kept in your browser.

## How events are categorized

An event belongs to a category when its title starts with a single word followed by a colon and a space:

| Title                    | Category | Shown as      |
| ------------------------ | -------- | ------------- |
| `UWCC: Weekly sync`      | `UWCC`   | `Weekly sync` |
| `Team lunch: Friday`     | none     | unchanged     |
| `Dentist`                | none     | unchanged     |

All-day events are left out unless you turn them on in Settings, where each day counts as a set number of hours.

## Setup

1. Create an OAuth client in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (type "Web application"), enable the Google Calendar API, and add `http://localhost:3000/api/auth/callback/google` as a redirect URI.
2. Copy `.env.example` to `.env.local` and fill it in.
3. Install and run:

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

The app only asks for read-only access to your calendars.

## Scripts

| Command             | What it does                  |
| ------------------- | ----------------------------- |
| `npm run dev`       | Start the dev server          |
| `npm run build`     | Production build              |
| `npm run lint`      | ESLint                        |
| `npm run typecheck` | TypeScript, no emit           |
| `npm test`          | Unit tests (Vitest)           |

## Layout

```
src/
  app/            Next.js routes: the page, and the auth and calendar API routes
  components/     UI: dashboard, sidebar, range picker, events table, settings
  hooks/          Settings store, calendar and event loading
  lib/            Plain logic with tests: categorizing, filtering, dates, export, Google access
  i18n/           English, French and Spanish strings
```

Built with Next.js 16, React 19, Tailwind CSS 4 and NextAuth 4. Next.js 16 differs from earlier versions; see `AGENTS.md`.
