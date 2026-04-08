# Google Calendar Billing Categorization App

I will build a Next.js web application that connects to your Google Calendar, fetches events for a chosen date range, automatically categorizes them based on your defined keywords, and calculates billable hours.

## User Review Required

> [!IMPORTANT]
> **Google OAuth Credentials Needed:** To connect to Google Calendar, you will need to provide a Google Client ID and Client Secret. You can get these by creating a project in the Google Cloud Console. I will provide a step-by-step guide for this if you need it.

> [!NOTE]
> **Data Storage:** For an immediate, fully functional MVP without the friction of a database setup, I plan to store your custom "Clients" (names, keywords, and hourly rates) locally in your browser (`localStorage`). Your calendar data will simply be fetched on-the-fly and never permanently stored. 

## Proposed Changes

### App Initialization & Configuration
- Create a new project in your workspace: `/Users/georgejosephnimeh/.gemini/antigravity/scratch/calendar-billing-app`.
- Framework: Next.js (App Router) heavily utilizing React Server Components.
- Styling: Tailwind CSS for a premium, clean aesthetic.
- Added Dependencies: 
  - `next-auth` v4 (for handling Google Sign-In and Token refresh securement).
  - `googleapis` (for calling the Google Calendar API).
  - `date-fns` (for easy date math and formatting).
  - `lucide-react` (for sleek icons).

### Core Components

#### 1. Authentication Layer
- Set up `app/api/auth/[...nextauth]/route.ts` to coordinate Google OAuth. 
- Request the `https://www.googleapis.com/auth/calendar.readonly` scope.
- Persist the Google `access_token` into the user's session so the backend can fetch calendar data on their behalf.

#### 2. Backend API
- Create an API route `app/api/calendar/events/route.ts` that takes `timeMin` and `timeMax` parameters, uses the user's authenticated Google token, and returns their raw calendar events.

#### 3. Frontend Dashboard & State
- **Client Manager View:** A section to define arbitrary clients (e.g., Name: "Acme Corp", Rate: $100/hr, Keywords: "Acme, Sync, Client A").
- **Date Picker & Fetcher:** Controls to query a specific timeframe.
- **Categorization Engine:** A utility that iterates over fetched events, maps `summary`/`description` against client keywords, calculates the duration (`endTime - startTime`), and computes the total billable amount.
- **Review Table:** A rich, interactive table displaying the categorized events, allowing manual category overrides, and showing total revenue summaries.
- **Export Utility:** A button that generates a `.csv` file of the table data for invoicing purposes.

## Open Questions

> [!IMPORTANT]
> 1. Are you comfortable creating the Google OAuth Client ID and Secret in the Google Cloud Console, or would you like me to walk you through that process first?
> 2. Is it acceptable to use local storage for your Client definitions (rates and keywords) for this initial version, or do you require a database right away?

## Verification Plan

### Manual Verification
- I will stand up the local development server.
- You will add your `.env.local` credentials.
- You will log in with Google, define a test client, fetch your calendar events, and verify the auto-categorization works locally.
