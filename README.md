# LifeOS

**One place for every application, deadline and important email.**

LifeOS is a personal command center for students and job seekers. It tracks jobs, internships, exams and scholarships through their whole lifecycle, ranks what needs attention today, and reads your Gmail so exam forms, fee dates and interview invites land on a sticky-note wall instead of getting buried.

> The original product vision (future modules, roadmap ideas) lives in [docs/VISION.md](docs/VISION.md).

---

## Features

| Area | What it does |
|---|---|
| **Today's Focus** | Ranks open opportunities by deadline urgency, priority, interview proximity and follow-ups, and shows your most urgent email deadlines. |
| **Inbox Brief** | Connects to Gmail (read-only). Gemini summarizes each email in one line, extracts deadlines and event dates, and pins anything actionable to a sticky-note wall grouped into *Do now / This week / Coming up*. Any email can become a Task or a tracked Opportunity in one click. |
| **Opportunities** | Full CRUD for jobs, internships, exams, scholarships, hackathons and more. **Log Application** records the site, the login you used, an encrypted password and a follow-up date; the site's favicon is fetched automatically. |
| **Applications** | Everything you've applied to, grouped by pipeline stage. |
| **Accounts Vault** | Saved application passwords, AES-256-GCM encrypted, revealed one at a time. |
| **Tasks & Notes** | Simple to-dos and notes. |
| **Analytics & Career Intelligence** | Application funnel, conversion rates, and the skills that keep showing up across your applications. |

Calendar, Reminders, Documents and AI Assistant pages exist as "Planned" placeholders.

---

## Tech stack

- **Client:** React 19, Vite, Tailwind CSS v4, TanStack Query, Framer Motion, Lucide icons
- **Server:** Node.js, Express, Zod
- **Database:** Supabase (Postgres), accessed only from the server
- **Integrations:** Gmail API (OAuth 2.0, read-only), Google Gemini

---

## Project structure

```text
LifeOS/
├── client/                     React app (Vite)
│   └── src/
│       ├── pages/              One file per route
│       ├── components/
│       │   ├── layout/         App shell, route guard, logo, placeholder page
│       │   ├── forms/          Opportunity / Task / Note modals
│       │   ├── inbox/          Sticky note, email row, Gmail onboarding, dashboard widget
│       │   └── ui/             Button, Modal, Field, ConfirmDialog, Skeleton, EmptyState
│       ├── hooks/              Data hooks (TanStack Query) and useAuth
│       ├── context/            Auth provider
│       ├── services/api.js     Axios instance
│       ├── utils/              Date/label formatting, inbox urgency logic
│       ├── constants.js        Enums and priority styles
│       └── index.css           Design tokens and global styles
│
├── server/                     Express API
│   ├── src/
│   │   ├── routes/             URL → controller wiring
│   │   ├── controllers/        Request handlers
│   │   ├── services/           Gmail and Gemini integrations
│   │   ├── validators/         Zod request schemas
│   │   ├── middleware/         Auth guard, error handler
│   │   ├── config/             Supabase and Google OAuth clients
│   │   ├── utils/              Encryption, JWT, DB row mappers, priority score
│   │   ├── constants.js
│   │   ├── app.js              Express app
│   │   └── server.js           Entry point
│   └── supabase/schema.sql     Complete database schema
│
├── docs/VISION.md              Original product vision
└── package.json                npm workspaces (client + server)
```

---

## Getting started

### 1. Requirements

- Node.js 20+
- A free [Supabase](https://supabase.com) project

### 2. Install

```bash
npm install
```

This installs both `client` and `server` (npm workspaces).

### 3. Create the database

In your Supabase project, open **SQL Editor → New query**, paste the whole of [`server/supabase/schema.sql`](server/supabase/schema.sql) and click **Run**.

### 4. Configure the server

```bash
cp server/.env.example server/.env
```

| Variable | Required | Where to get it |
|---|---|---|
| `SUPABASE_URL` | Yes | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Same page — the **service_role** (secret) key, not the anon/publishable one |
| `JWT_SECRET` | Yes | Any long random string |
| `CREDENTIAL_ENCRYPTION_KEY` | Yes | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `CLIENT_ORIGIN` | Yes | `http://localhost:5173` in development |
| `GEMINI_API_KEY` | For Inbox Brief | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (free) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | For Inbox Brief | See [Inbox Brief setup](#inbox-brief-setup) |
| `GEMINI_MODEL`, `GOOGLE_REDIRECT_URI`, `PORT`, `JWT_EXPIRES_IN` | No | Sensible defaults are built in |

### 5. Run

Use two terminals:

```bash
npm run dev:server    # API on http://localhost:5000
npm run dev:client    # App on http://localhost:5173
```

Open **http://localhost:5173**. The client proxies `/api` to the server.

### Demo account

If the demo data has been seeded:

- **Email:** `demo@lifeos.app`
- **Password:** `Demo@12345`

Otherwise just register a new account.

---

## Inbox Brief setup

1. In [Google Cloud Console](https://console.cloud.google.com/), create a project and enable the **Gmail API**.
2. Configure the **OAuth consent screen** (External, Testing) and add your Gmail address under **Test users**.
3. Create an **OAuth client ID** of type *Web application* with the redirect URI
   `http://localhost:5173/api/gmail/callback`.
4. Put the client ID and secret in `server/.env` and restart the server.

Notes:

- While the consent screen is in *Testing*, only listed test users can connect and Google asks you to reconnect every 7 days. Letting anyone connect requires Google's verification for the `gmail.readonly` scope.
- Promotions and Social mail are skipped to save AI quota. Newsletters and FYI mail are summarized but hidden by default.
- Only summaries, sender, subject and dates are stored — never full email bodies. Disconnecting revokes access and deletes every stored summary.

---

## Scripts

Run from the project root:

| Command | Description |
|---|---|
| `npm run dev:server` | Start the API with auto-reload |
| `npm run dev:client` | Start the Vite dev server |
| `npm run build` | Production build of the client (`client/dist`) |
| `npm run lint` | Lint client and server with oxlint |

---

## API

All routes are under `/api` and, except auth and the Gmail OAuth callback, require the session cookie.

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/auth/register`, `/auth/login`, `/auth/logout` | Account and session |
| `GET` | `/auth/me` | Current user |
| `GET` | `/dashboard/today` | Ranked opportunities and overview counts |
| `GET POST` | `/opportunities` | List (filters: `status`, `category`, `priority`, `q`) / create |
| `GET PATCH DELETE` | `/opportunities/:id` | Read / update / delete |
| `POST DELETE` | `/opportunities/:id/credential` | Save or remove the encrypted password |
| `GET` | `/opportunities/:id/credential/reveal` | Decrypt and return the password |
| `GET POST` · `PATCH DELETE` | `/tasks` · `/tasks/:id` | Tasks |
| `GET POST` · `PATCH DELETE` | `/notes` · `/notes/:id` | Notes |
| `GET` | `/analytics/summary` | Funnel, conversion rates, top skills |
| `GET` | `/gmail/status`, `/gmail/connect-url` | Gmail connection state / start OAuth |
| `GET` | `/gmail/callback` | OAuth redirect target |
| `POST` | `/gmail/sync` | Fetch and summarize new mail (rate limited) |
| `DELETE` | `/gmail` | Disconnect and erase summaries |
| `GET` | `/inbox` | Email summaries (filters: `status`, `category`) |
| `PATCH` | `/inbox/:id` | Mark done / hidden / pinned |
| `POST` | `/inbox/:id/task`, `/inbox/:id/opportunity` | Turn an email into a Task or Opportunity |

---

## Security

- Passwords are hashed with bcrypt; sessions are JWTs in an HTTP-only cookie.
- Saved application passwords and Gmail refresh tokens are encrypted with AES-256-GCM using `CREDENTIAL_ENCRYPTION_KEY`, which never leaves the server.
- The Supabase service role key is server-only. Row Level Security is off by design, so every query filters by `user_id`.
- The Gmail OAuth `state` is a short-lived signed token, which blocks attaching someone else's inbox to your account.
- Email content sent to Gemini is treated as untrusted data, and the model's output is validated before it's stored.
- Helmet, CORS limited to `CLIENT_ORIGIN`, rate limits on auth and Gmail sync.

---

## Troubleshooting

**"Can't reach the database right now"** — Supabase pauses free projects after about a week of inactivity. Open the Supabase dashboard and click **Restore project**, then restart the server.

**"Invalid API key"** — `SUPABASE_SERVICE_ROLE_KEY` is missing or is the anon/publishable key.

**Inbox Brief shows setup steps** — `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are not set, or the server wasn't restarted after adding them.

**"AI summarizer hit its free-tier rate limit"** — wait a minute and sync again; unsummarized emails are picked up on the next sync.
