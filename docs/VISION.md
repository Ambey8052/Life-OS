# 🚀 LifeOS — Personal Opportunity & Information Command Center

> **One place to remember everything that matters.**

LifeOS is an intelligent personal information and opportunity management platform designed for students, job seekers, freelancers, working professionals, entrepreneurs, and anyone who regularly interacts with multiple websites, applications, deadlines, accounts, tasks, documents, and opportunities.

Instead of remembering:

* Where did I apply?
* Which email/username did I use?
* What is the application deadline?
* When is the interview?
* Which documents were submitted?
* What was the login website?
* Which opportunities are most important?
* What should I do today?
* Which application is still pending?
* When should I follow up?
* Which credentials belong to which platform?

LifeOS creates a centralized, intelligent command center for managing all of them.

---

# ⚡ Getting Started (MVP)

The current codebase implements Phase 1–3 of the roadmap: authentication, opportunity CRUD, and an automatically-prioritized dashboard.

```text
lifeos/
├── server/   Express + Supabase (Postgres) API (auth, opportunities, dashboard)
└── client/   React + Vite + Tailwind frontend
```

## Requirements

* Node.js 20+
* A [Supabase](https://supabase.com) project (free tier is enough). LifeOS uses its own bcrypt + JWT cookie auth rather than Supabase Auth, so Supabase here is just the Postgres database, accessed from the server via the **service_role** key.

## Setup

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Create the schema
# In your Supabase project's SQL Editor, run server/supabase/schema.sql
# (existing projects: run the files in server/supabase/migrations/ you haven't run yet)

# 3. Configure the server
cd ../server
cp .env.example .env
# edit .env — set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (Project Settings -> API
# -> "service_role" secret key — NOT the anon/publishable key, and never expose this
# key to the browser), and a real JWT_SECRET

# 4. Run both apps (two terminals)
npm run dev      # from server/  -> http://localhost:5000
npm run dev      # from client/  -> http://localhost:5173
```

The client dev server proxies `/api` requests to `http://localhost:5000`, so just open `http://localhost:5173` and register an account.

> Supabase pauses free projects after about a week without activity. If the server logs `fetch failed` / the project URL stops resolving, open the Supabase dashboard and click **Restore project**.

## Inbox Brief setup (Gmail + AI)

Inbox Brief reads your recent Gmail (read-only), summarizes each email with Gemini, and pins anything with a deadline to a sticky-note wall. It needs two things in `server/.env`:

1. **Gemini API key** — free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) → `GEMINI_API_KEY`. `GEMINI_MODEL` defaults to `gemini-flash-lite-latest` (the free tier with the highest rate limits).
2. **Google OAuth client** — in [Google Cloud Console](https://console.cloud.google.com/):
   1. Create a project and enable the **Gmail API**.
   2. Configure the **OAuth consent screen** (External, Testing) and add your Gmail address under **Test users**.
   3. Create an **OAuth client ID** → *Web application*, with authorized redirect URI `http://localhost:5173/api/gmail/callback`.
   4. Copy the client ID/secret into `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` and restart the server.

While the consent screen is in *Testing*, only listed test users can connect, and Google expires refresh tokens after 7 days (you'll be asked to reconnect). Publishing the app for real users requires Google's restricted-scope verification for `gmail.readonly`.

**What's stored:** AI summaries, sender, subject and dates — never full email bodies. The Gmail refresh token is AES-256-GCM encrypted. Disconnecting revokes access and deletes every stored summary. Promotions and Social tabs are skipped entirely.

## What's implemented

**Backend** — cookie-based JWT auth (register / login / logout / me), Opportunity CRUD (category, status, priority, deadline, interview, follow-up), Task CRUD, Note CRUD, an analytics summary endpoint (funnel, conversion rates, status/category breakdown, top skills), and a computed priority score (deadline urgency + priority + interview proximity + follow-up + status) that powers `/api/dashboard/today`.

**Frontend** — every page in the [Frontend Pages](#-frontend-pages) list exists and is routed, with a sidebar nav grouped the same way (Overview / Opportunities / Planning / Insights / Vault):

| Page | Status |
|---|---|
| Landing, Login, Register | Functional |
| Dashboard (Today's Focus) | Functional — priority-scored buckets |
| Opportunities | Functional — full CRUD |
| Applications | Functional — Opportunities grouped by pipeline stage |
| Tasks | Functional — full CRUD |
| Notes | Functional — full CRUD |
| Analytics | Functional — funnel + conversion rates |
| Career Intelligence | Functional — top skills across your opportunities |
| Inbox Brief | Functional — Gmail sync, AI summaries, sticky-note action wall, one-click Task / Opportunity creation |
| Settings | Functional — profile view + sign out |
| Accounts Vault | Functional — AES-256-GCM encrypted passwords saved per application, revealed one at a time |
| Calendar, Reminders, Documents, AI Assistant | Placeholder "coming soon" screens — these need real infrastructure (calendar OAuth, BullMQ scheduler, object storage, a chat LLM layer) before they can be genuinely functional, so they're stubbed rather than faked. |

**UI/UX** — dark theme with a teal accent (Plus Jakarta Sans + Newsreader typography, Lucide icons throughout, no emoji-as-icons), a sidebar layout with an animated active-page indicator, page transitions, staggered list entrance/exit animations, skeleton loaders instead of "Loading…" text, toast notifications, and a custom confirm dialog in place of native `confirm()`/`alert()`. Built with [Framer Motion](https://www.framer.com/motion/) + [react-hot-toast](https://react-hot-toast.com/) on top of Tailwind CSS.

See [Recommended Development Order](#-recommended-development-order) for the intended sequence for the remaining phases.

---

# 🎯 Problem Statement

Modern users interact with dozens or hundreds of platforms:

* Job portals
* Internship platforms
* Government job portals
* Scholarship websites
* College portals
* Competitive examinations
* Freelancing platforms
* Company career pages
* Learning platforms
* Banking/financial services
* Productivity tools
* SaaS applications
* Personal projects
* Important documents
* Applications and registrations

Information becomes fragmented across:

* Browser history
* Bookmarks
* WhatsApp messages
* Emails
* Notes apps
* Excel sheets
* Calendar
* Screenshots
* Sticky notes
* Memory

As the number of applications increases, users start missing deadlines, interviews, follow-ups, registrations, and important tasks.

### LifeOS solves this problem by creating a unified personal command center.

---

# 💡 Core Idea

The user provides information once.

For example:

```text
Website:
https://careers.google.com

Category:
Job

Position:
Software Engineer Intern

Login:
karan@example.com

Deadline:
25 August 2026

Interview:
2 September 2026, 11:00 AM

Priority:
High

Notes:
Prepare DSA + System Design

Reminder:
3 days before deadline
```

LifeOS automatically enriches the entry:

```text
Google
Software Engineer Intern
━━━━━━━━━━━━━━━━━━━━━━
🟢 Application Pending
🔥 High Priority

Deadline:
25 Aug 2026

Interview:
2 Sep 2026 • 11:00 AM

Login:
karan@example.com

Next Action:
Prepare DSA

Reminder:
22 Aug 2026

Status:
Applied
```

The user no longer needs to remember everything.

---

# 🌟 Vision

LifeOS should eventually become:

> **A personal operating system for opportunities, commitments, accounts and important information.**

It should answer questions such as:

```text
"What do I need to do today?"

"Which applications are waiting for a response?"

"Which deadlines are coming this week?"

"Where did I apply for internships?"

"Which accounts use my personal email?"

"Which opportunities are high priority?"

"Which applications need follow-up?"

"What interviews are scheduled next week?"

"Show me all pending applications."

"Which opportunities should I prioritize?"

"Which websites have my accounts?"

"Remind me about everything important tomorrow."
```

---

# 🧠 Major Modules

## 1. Unified Dashboard

The dashboard is the central command center.

### Dashboard sections

```text
┌──────────────────────────────────────────────┐
│                 LIFEOS                       │
├──────────────────────────────────────────────┤
│                                              │
│  🔥 Today's Priorities                       │
│                                              │
│  1. Google Interview        11:00 AM         │
│  2. Internship Deadline     Tomorrow         │
│  3. Govt Exam Application   2 Days Left      │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│  📊 Overview                                 │
│                                              │
│  Applications       37                       │
│  Interviews          4                       │
│  Pending Tasks       8                       │
│  Deadlines           6                       │
│  Accounts           42                       │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│  ⚠️ Needs Attention                          │
│                                              │
│  • Application deadline approaching           │
│  • Interview preparation pending              │
│  • Follow-up required                         │
│                                              │
└──────────────────────────────────────────────┘
```

---

# 2. Opportunity Tracker

Supports:

* Jobs
* Internships
* Freelancing opportunities
* Hackathons
* Scholarships
* Government jobs
* Government schemes
* Competitions
* Exams
* College applications
* Certifications
* Research opportunities
* Events
* Personal opportunities

Each opportunity can contain:

```text
Title
Company/Organization
Website
Category
Role
Location
Salary/Stipend
Application URL
Application Date
Deadline
Interview Date
Interview Link
Status
Priority
Tags
Notes
Attachments
Contacts
Follow-up Date
Custom Reminders
```

---

# 3. Application Lifecycle Tracking

Every application follows a lifecycle.

```text
DISCOVERED
     ↓
SAVED
     ↓
APPLIED
     ↓
SCREENING
     ↓
ASSESSMENT
     ↓
INTERVIEW
     ↓
OFFER
     ↓
ACCEPTED
```

Alternative:

```text
REJECTED
WITHDRAWN
EXPIRED
ON HOLD
```

This creates a complete history of the user's journey.

---

# 4. Account Vault

The user can associate accounts with websites.

Example:

```text
┌─────────────────────────────┐
│ LinkedIn                    │
│ linkedin.com                │
│                             │
│ Username: karan@example.com │
│ Password: •••••••••••       │
│                             │
│ Category: Career            │
│ Last Updated: 10 Aug 2026   │
└─────────────────────────────┘
```

## ⚠️ Security Principle

Passwords must **NEVER** be stored as plaintext.

Instead:

```text
User Password
      ↓
Master Key
      ↓
Key Derivation
      ↓
Encryption Key
      ↓
AES-256-GCM
      ↓
Encrypted Credential
      ↓
MongoDB
```

Authentication password:

```text
Argon2id / bcrypt
        ↓
Password Hash
        ↓
MongoDB
```

The application should never store the user's login password in reversible form.

For highly sensitive credentials, a dedicated password manager integration can eventually be supported.

---

# 5. Automatic Website Recognition

When the user enters:

```text
https://github.com
```

LifeOS automatically attempts to retrieve:

```text
Website Name
Website Title
Favicon
Logo
Domain
Description
OpenGraph metadata
```

Example:

```text
github.com
     ↓
Metadata Service
     ↓
┌───────────────────────┐
│ GitHub                │
│ github.com            │
│ GitHub logo           │
└───────────────────────┘
```

### Metadata pipeline

```text
URL
 ↓
URL Validation
 ↓
Domain Extraction
 ↓
Metadata Fetch
 ↓
HTML Parsing
 ↓
OpenGraph Extraction
 ↓
Favicon Detection
 ↓
Logo Detection
 ↓
Normalized Website Object
 ↓
MongoDB
```

A caching layer should prevent repeated requests to the same domain.

---

# 6. Smart Reminder Engine

Users can define:

```text
Deadline
Interview
Follow-up
Custom Reminder
Recurring Reminder
Document Expiry
Subscription Renewal
Exam Date
Application Opening
Application Closing
```

Example:

```text
Deadline: 30 August

Reminders:

7 days before
3 days before
1 day before
2 hours before
```

Notifications can be delivered through:

* In-app notification
* Email
* Push notification
* Browser notification
* Telegram/WhatsApp integration (future)
* Calendar integration

---

# 7. Smart Priority System

Instead of manually sorting everything, LifeOS calculates priority.

Example scoring model:

```text
Priority Score =
Deadline Urgency
+ User Priority
+ Opportunity Value
+ Interview Proximity
+ Follow-up Requirement
+ Status Importance
```

Example:

```text
Google Internship
Deadline: Tomorrow
Priority: High
Interview: Scheduled

Score: 94/100

🔥 CRITICAL
```

While:

```text
Online Course
Deadline: 45 days
Priority: Low

Score: 22/100

🟢 LOW
```

---

# 8. Today's Command Center

The system should answer:

> "What should I focus on today?"

Example:

```text
GOOD MORNING KARAN 👋

You have 7 important items today.

🔥 CRITICAL

1. Submit XYZ Internship Application
   Deadline: Today 11:59 PM

2. Prepare for Google Interview
   Interview: Tomorrow 11:00 AM

⚠️ IMPORTANT

3. Follow up with ABC HR
   Due: Today

4. Complete Government Exam Registration
   2 days remaining

🟢 OPTIONAL

5. Complete React course
6. Review notes
7. Update GitHub
```

---

# 9. Follow-up Management

Many users apply and forget to follow up.

LifeOS automatically tracks:

```text
Application Date
      ↓
Waiting Period
      ↓
Follow-up Reminder
      ↓
Follow-up Completed
```

Example:

```text
Applied:
10 August

No response after:
7 days

System:
"Follow up with HR today."
```

---

# 10. Notes & Knowledge Vault

The platform should not only track opportunities.

Users can store:

```text
Notes
Ideas
Meeting Notes
Interview Questions
Company Research
Technical Notes
Important Information
Personal Plans
Project Ideas
```

Notes can be connected to entities.

Example:

```text
Google
 ├── Application
 ├── Interview
 ├── Notes
 ├── Contact
 └── Documents
```

---

# 11. Document Management

Users can attach:

* Resume
* Cover Letter
* Certificates
* Mark Sheets
* ID Documents
* Offer Letters
* Application PDFs
* Interview Documents

Documents should be stored using secure object storage such as:

```text
AWS S3
Cloudinary
Cloudflare R2
```

MongoDB should store metadata rather than large binary files.

---

# 12. Calendar Integration

LifeOS can integrate with:

```text
Google Calendar
Microsoft Outlook Calendar
```

Events:

```text
Interview
Exam
Application Deadline
Meeting
Follow-up
Reminder
```

Example:

```text
LifeOS
   ↓
Calendar Sync
   ↓
Google Calendar
```

Two-way synchronization can eventually be supported.

---

# 13. AI Assistant 🤖

This can become one of the strongest differentiating features.

Instead of being just a CRUD application, LifeOS can provide an AI layer.

Users can ask:

```text
"What should I do today?"

"Which application should I prioritize?"

"Show applications where I haven't received a response."

"Which interviews are coming this week?"

"Prepare me for tomorrow's interview."

"Summarize this job description."

"Compare these three opportunities."

"Create a follow-up message for this recruiter."

"Why am I missing deadlines?"

"Find patterns in my applications."

"Which skills are repeatedly required by companies I applied to?"
```

---

# 14. AI Opportunity Analysis

When a job description is added:

```text
Job Description
       ↓
AI Processing
       ↓
Extract:
       ↓
Skills
Experience
Salary
Location
Deadline
Technology
Responsibilities
Requirements
       ↓
Store Structured Data
```

Example:

```text
Required Skills:

React        ██████████
Node.js      █████████
MongoDB      ███████
Docker       ████████
AWS          ██████
DSA          █████
```

The AI can compare these requirements against the user's skill profile.

```text
Match Score: 82%

Strong:
✓ React
✓ Node.js
✓ MongoDB
✓ Docker

Needs Improvement:
⚠ AWS
⚠ System Design
```

---

# 15. Personal Career Intelligence

LifeOS can maintain a personal skill graph.

```text
User
 │
 ├── JavaScript
 ├── React
 ├── Node.js
 ├── MongoDB
 ├── Docker
 ├── n8n
 └── DSA
```

Opportunities contribute requirements:

```text
Job A → React + Node + AWS
Job B → React + Docker + SQL
Job C → Java + Spring Boot
Job D → Python + AI
```

The system can identify trends:

```text
Most requested skill:
Docker

Second:
SQL

Third:
AWS
```

This gives the user actionable career intelligence.

---

# 16. Opportunity Discovery

Future versions can allow users to connect external sources.

Possible sources:

```text
Company Career Pages
Job APIs
Government Portals
Internship Platforms
Scholarship Portals
RSS Feeds
Email
Telegram
```

The system can normalize incoming opportunities:

```text
External Source
      ↓
Ingestion Engine
      ↓
Duplicate Detection
      ↓
Opportunity Parser
      ↓
AI Classification
      ↓
Personal Relevance Score
      ↓
User Dashboard
```

---

# 17. Email Intelligence

A powerful future feature is connecting Gmail/Outlook.

Example:

```text
Inbox
  ↓
Email Classification
  ↓
Career / Opportunity / Interview / Offer
  ↓
AI Extraction
  ↓
LifeOS
```

If an email says:

```text
"Your interview has been scheduled for
25 August at 11 AM."
```

LifeOS could automatically detect:

```text
Interview
Date
Time
Company
Position
Meeting Link
```

Then:

```text
Application
      ↓
Interview Event
      ↓
Reminder
      ↓
Calendar
```

The user does not need to manually enter everything.

---

# 🏗️ MERN Architecture

```text
                    ┌─────────────────────┐
                    │      React.js       │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │
                         HTTPS / REST
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Node.js         │
                    │     Express.js      │
                    │      API Layer      │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
       Authentication     Business Logic     AI Service
             │                 │                 │
             └─────────────────┼─────────────────┘
                               │
                 ┌─────────────┼─────────────┐
                 │             │             │
                 ▼             ▼             ▼
             MongoDB         Redis        Object Storage
                 │             │             │
                 │             │             │
              Database       Cache        Documents
```

---

# 🔥 Advanced Production Architecture

```text
                         CLIENT
                           │
                           ▼
                    React + Vite
                           │
                           ▼
                    API Gateway
                           │
                           ▼
                ┌────────────────────┐
                │   Express Server   │
                └─────────┬──────────┘
                          │
       ┌──────────────────┼──────────────────┐
       │                  │                  │
       ▼                  ▼                  ▼
   Auth Service      Opportunity        User Service
                        Service
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
            ┌─────────────┼─────────────┐
            │             │             │
            ▼             ▼             ▼
         MongoDB        Redis        AI Service
            │             │             │
            │             ▼             │
            │        BullMQ Queue       │
            │             │             │
            │             ▼             │
            │      Background Workers   │
            │             │             │
            │     ┌───────┼────────┐    │
            │     ▼       ▼        ▼    │
            │ Reminder  Metadata  Email  │
            │ Worker    Worker    Worker │
            │                           │
            └───────────────────────────┘
```

---

# 🧩 Technology Stack

## Frontend

```text
React.js
Vite
Tailwind CSS
React Router
TanStack Query
Zustand
React Hook Form
Zod
Recharts
Lucide React
```

## Backend

```text
Node.js
Express.js
REST API
JWT / Session Authentication
Zod
Mongoose
```

## Database

```text
MongoDB
MongoDB Atlas
```

## Caching & Jobs

```text
Redis
BullMQ
```

## AI

```text
LLM API
Embeddings
Vector Search
RAG
AI Agents
```

## Storage

```text
Cloudinary
AWS S3
Cloudflare R2
```

## Notifications

```text
Email
Web Push
Firebase Cloud Messaging
Calendar APIs
```

## DevOps

```text
Docker
Docker Compose
GitHub Actions
Nginx
CI/CD
Cloud Deployment
```

---

# 📁 Recommended Project Structure

```text
lifeos/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── utils/
│   │   ├── types/
│   │   └── main.jsx
│   │
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── workers/
│   │   ├── jobs/
│   │   ├── utils/
│   │   ├── config/
│   │   └── app.js
│   │
│   └── package.json
│
├── ai/
│   ├── agents/
│   ├── prompts/
│   ├── embeddings/
│   ├── parsers/
│   └── services/
│
├── docker/
│   ├── Dockerfile.client
│   ├── Dockerfile.server
│   └── nginx.conf
│
├── docker-compose.yml
├── .env.example
├── README.md
└── package.json
```

---

# 🗄️ Database Design

## User

```javascript
{
  _id,
  name,
  email,
  passwordHash,
  profile,
  preferences,
  notificationSettings,
  createdAt,
  updatedAt
}
```

---

## Opportunity

```javascript
{
  _id,
  userId,

  title,
  organization,
  category,

  website,
  applicationUrl,

  status,
  priority,

  deadline,
  appliedAt,

  interview: {
    scheduled,
    date,
    meetingUrl
  },

  salary,
  location,

  skills: [],

  notes: [],
  attachments: [],

  followUpDate,

  reminderIds: [],

  createdAt,
  updatedAt
}
```

---

## Website

```javascript
{
  _id,
  domain,
  name,
  faviconUrl,
  logoUrl,
  description,
  metadata,
  lastFetchedAt
}
```

Websites can be shared/cached across users where appropriate.

---

## Account

```javascript
{
  _id,
  userId,
  websiteId,

  username,

  encryptedSecret,

  category,

  notes,

  lastPasswordUpdatedAt,

  createdAt,
  updatedAt
}
```

The actual encryption architecture should be designed carefully so that database compromise does not expose credentials.

---

## Reminder

```javascript
{
  _id,
  userId,

  title,
  description,

  targetType,
  targetId,

  scheduledAt,

  channels: [
    "in_app",
    "email",
    "push"
  ],

  status,

  recurrence,

  createdAt
}
```

---

## Task

```javascript
{
  _id,
  userId,

  title,
  description,

  dueDate,
  priority,

  status,

  linkedOpportunityId,

  tags,

  createdAt,
  updatedAt
}
```

---

## Note

```javascript
{
  _id,
  userId,

  title,
  content,

  tags,

  linkedEntities,

  embedding,

  createdAt,
  updatedAt
}
```

---

# 🔐 Authentication Architecture

```text
Registration
     ↓
Validate Input
     ↓
Hash Password
     ↓
Create User
     ↓
Issue Session
     ↓
HTTP-only Secure Cookie
```

Login:

```text
Email + Password
       ↓
Validate
       ↓
Compare Hash
       ↓
Create Session
       ↓
HTTP-only Cookie
       ↓
Authenticated User
```

Recommended protections:

```text
Argon2id
HTTP-only cookies
Secure cookies
SameSite protection
CSRF protection
Rate limiting
Input validation
Helmet
CORS restrictions
Session rotation
Login monitoring
Audit logging
```

---

# 🔒 Credential Vault Architecture

This feature requires special care.

Do NOT implement:

```text
password: "mypassword123"
```

Instead:

```text
User
 ↓
Unlock Vault
 ↓
Derive Encryption Key
 ↓
Encrypt Credential
 ↓
Store Ciphertext
```

Database:

```text
encryptedSecret
iv
authenticationTag
keyVersion
```

The application should minimize situations where decrypted credentials exist in memory.

For a production-grade version, consider a dedicated secret-management architecture instead of treating MongoDB as a password manager.

---

# 🔌 REST API Design

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/refresh
```

## Opportunities

```http
GET    /api/opportunities
POST   /api/opportunities
GET    /api/opportunities/:id
PATCH  /api/opportunities/:id
DELETE /api/opportunities/:id
```

## Applications

```http
POST  /api/applications
GET   /api/applications
PATCH /api/applications/:id/status
```

## Accounts

```http
GET    /api/accounts
POST   /api/accounts
GET    /api/accounts/:id
PATCH  /api/accounts/:id
DELETE /api/accounts/:id
```

## Reminders

```http
GET    /api/reminders
POST   /api/reminders
PATCH  /api/reminders/:id
DELETE /api/reminders/:id
```

## Tasks

```http
GET    /api/tasks
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
```

## Website Metadata

```http
POST /api/metadata/resolve
GET  /api/websites/:domain
```

## AI

```http
POST /api/ai/analyze-opportunity
POST /api/ai/prioritize
POST /api/ai/summarize
POST /api/ai/chat
POST /api/ai/interview-prep
```

---

# ⚙️ Background Job Architecture

Some operations should not block the API request.

Example:

```text
User adds URL
      ↓
API responds immediately
      ↓
Job added to Redis
      ↓
BullMQ
      ↓
Metadata Worker
      ↓
Fetch website information
      ↓
Store result
      ↓
Frontend receives update
```

Other background jobs:

```text
Reminder Worker
Email Worker
Document Processing Worker
AI Analysis Worker
Website Metadata Worker
Calendar Sync Worker
Opportunity Import Worker
Duplicate Detection Worker
```

---

# 🔄 Complete Application Flow

## Creating an Opportunity

```text
User
 │
 │ Paste URL
 ▼
React Frontend
 │
 │ POST /api/opportunities
 ▼
Express API
 │
 ├── Authenticate User
 ├── Validate Input
 ├── Normalize URL
 ├── Detect Duplicate
 │
 ▼
MongoDB
 │
 └── Create Opportunity
 │
 ▼
Redis Queue
 │
 ▼
Metadata Worker
 │
 ├── Fetch favicon
 ├── Fetch title
 ├── Extract logo
 └── Extract metadata
 │
 ▼
MongoDB
 │
 ▼
WebSocket / Polling
 │
 ▼
React Dashboard
 │
 ▼
Updated Card
```

---

# 🔔 Reminder Flow

```text
Opportunity
     ↓
Deadline
     ↓
Reminder Rules
     ↓
Redis / BullMQ
     ↓
Scheduler
     ↓
Notification Worker
     ↓
Email / Push / In-App
     ↓
User
```

---

# 🧠 AI Prioritization Flow

```text
User Data
   │
   ├── Opportunities
   ├── Deadlines
   ├── Tasks
   ├── Interviews
   └── Preferences
           │
           ▼
      AI / Rule Engine
           │
           ▼
     Priority Calculation
           │
           ▼
      Daily Action Plan
           │
           ▼
       Dashboard
```

---

# 🔎 Search Architecture

Users should be able to search globally:

```text
"Google"

"React internship"

"pending applications"

"August deadlines"

"government jobs"

"interviews"

"accounts using Gmail"
```

Search should operate across:

```text
Opportunities
Applications
Accounts
Notes
Tasks
Documents
Contacts
```

For advanced semantic search:

```text
User Query
    ↓
Embedding
    ↓
Vector Search
    ↓
Relevant Entities
    ↓
AI Ranking
    ↓
Answer
```

MongoDB Atlas Vector Search can eventually support this architecture.

---

# 🧠 Intelligent Duplicate Detection

Suppose the user adds:

```text
https://careers.company.com/job/123
```

and later:

```text
https://www.company.com/careers/job/123/
```

LifeOS should recognize that these may refer to the same opportunity.

Pipeline:

```text
URL Normalization
       ↓
Domain Matching
       ↓
Job ID Detection
       ↓
Title Similarity
       ↓
Organization Matching
       ↓
Duplicate Probability
```

Then:

```text
"This opportunity may already exist."

[Merge] [Create Anyway]
```

---

# 📊 Analytics

LifeOS should provide useful analytics instead of meaningless charts.

Example:

```text
Applications: 57

Interviews: 9

Offers: 2

Rejected: 31

Pending: 15

Interview Conversion:
15.7%

Offer Conversion:
3.5%
```

Career analytics:

```text
Most Applied Role:
Full Stack Developer

Most Requested Skill:
React

Highest Interview Conversion:
Startup

Best Source:
Company Career Pages
```

---

# 📈 Application Funnel

```text
57 Applications
      ↓
32 Screenings
      ↓
15 Assessments
      ↓
9 Interviews
      ↓
2 Offers
```

This helps users understand where they are losing opportunities.

---

# 🌐 Browser Extension — Future Version

A Chrome/Edge extension can make LifeOS dramatically more useful.

When the user visits a job page:

```text
Job Page
   ↓
Browser Extension
   ↓
Extract:
Title
Company
Role
Deadline
Location
Salary
Description
   ↓
"Save to LifeOS"
   ↓
Opportunity Created
```

This eliminates manual data entry.

---

# 📧 Email-to-LifeOS

Future users can forward emails to:

```text
inbox@lifeos.app
```

Example:

```text
Recruiter Email
      ↓
Email Parser
      ↓
AI Extraction
      ↓
Opportunity
      ↓
Interview
      ↓
Reminder
```

---

# 🔗 n8n Automation Layer

n8n can be used as an optional automation layer.

Example:

```text
Gmail
 ↓
n8n
 ↓
Detect Job Email
 ↓
AI Extraction
 ↓
LifeOS API
 ↓
Create Opportunity
 ↓
Create Reminder
```

Other possibilities:

```text
Google Drive
 ↓
n8n
 ↓
New Resume
 ↓
LifeOS
```

or:

```text
LifeOS
 ↓
n8n
 ↓
Telegram
 ↓
"Interview tomorrow at 11 AM"
```

n8n should complement the backend rather than replace the application's core business logic.

---

# 🛡️ Security Architecture

Because LifeOS may contain extremely sensitive information, security must be treated as a core product feature.

### Required

```text
HTTPS
HTTP-only Cookies
CSRF Protection
CORS
Helmet
Rate Limiting
Input Validation
XSS Protection
MongoDB Security
Encryption at Rest
Encrypted Credentials
Audit Logs
Session Management
Secure File Uploads
File Type Validation
File Size Limits
```

### Never store

```text
Plaintext passwords
Raw authentication tokens
API keys in frontend
Secrets inside Git
Master encryption keys in MongoDB
```

---

# 🧾 Audit Log

Sensitive operations should be logged.

Example:

```text
14 Aug 2026
00:14
Credential Vault Unlocked

14 Aug 2026
00:16
Account Updated

14 Aug 2026
00:18
New Opportunity Created
```

Never log actual passwords or secret values.

---

# 🧑‍💻 Frontend Pages

```text
/
├── Landing Page
├── Login
├── Register
│
└── Dashboard
    ├── Overview
    ├── Today's Focus
    ├── Opportunities
    ├── Applications
    ├── Accounts Vault
    ├── Tasks
    ├── Calendar
    ├── Reminders
    ├── Notes
    ├── Documents
    ├── Analytics
    ├── AI Assistant
    ├── Career Intelligence
    └── Settings
```

---

# 🎨 UI Philosophy

The interface should feel like:

```text
Notion
     +
Linear
     +
Google Calendar
     +
Password Manager
     +
AI Assistant
```

But without becoming complicated.

The primary design principle:

> **The user should understand what requires attention within 5 seconds of opening the dashboard.**

---

# 🚦 Status Colors / Visual Language

```text
🔥 Critical
🔴 Overdue
🟠 Due Soon
🟡 Waiting
🔵 Scheduled
🟢 Completed
⚫ Archived
```

Use color as secondary information; status should also be represented with text/icons for accessibility.

---

# 🔄 Offline-Friendly Architecture

Future versions can support:

```text
React
 ↓
IndexedDB
 ↓
Offline Changes
 ↓
Sync Queue
 ↓
Backend
 ↓
Conflict Resolution
```

Useful when users have unreliable internet connectivity.

---

# 🧪 Testing Strategy

## Frontend

```text
Unit Tests
Component Tests
Integration Tests
E2E Tests
```

Tools:

```text
Vitest
React Testing Library
Playwright
```

## Backend

```text
Jest / Vitest
Supertest
MongoDB Test Database
```

Test:

```text
Authentication
Authorization
CRUD
Validation
Reminder Scheduling
Encryption
Duplicate Detection
AI Parsing
File Uploads
```

---

# 🐳 Docker Architecture

```text
Docker Compose

├── frontend
├── backend
├── mongodb
├── redis
└── worker
```

Example:

```text
docker compose up
        │
        ├── React
        ├── Express
        ├── MongoDB
        ├── Redis
        └── BullMQ Worker
```

Production:

```text
Cloud
 │
 ├── Frontend
 ├── API
 ├── Worker
 ├── MongoDB Atlas
 ├── Redis
 └── Object Storage
```

---

# 🚀 CI/CD

```text
Git Push
   ↓
GitHub
   ↓
GitHub Actions
   ↓
Lint
   ↓
Unit Tests
   ↓
Build
   ↓
Docker Build
   ↓
Security Scan
   ↓
Deploy
```

---

# 📦 MVP

Do NOT build everything at once.

The first version should focus on solving the core problem.

## MVP Features

```text
✓ Authentication
✓ Dashboard
✓ Add Opportunity
✓ Application Tracking
✓ Status Management
✓ Deadline
✓ Reminder
✓ Priority
✓ Notes
✓ Website Metadata
✓ Favicon
✓ Search
✓ Basic Analytics
```

---

# 🚀 Version 2

```text
✓ Account Vault
✓ Secure Credential Encryption
✓ Calendar
✓ Documents
✓ Follow-up Automation
✓ Email Notifications
✓ Advanced Search
✓ Recurring Reminders
```

---

# 🧠 Version 3 — AI

```text
✓ AI Assistant
✓ Job Description Analyzer
✓ Skill Matching
✓ AI Priority Engine
✓ Interview Preparation
✓ AI Follow-up Generator
✓ Semantic Search
✓ Career Intelligence
```

---

# 🤖 Version 4 — Automation

```text
✓ Browser Extension
✓ Gmail Integration
✓ Outlook Integration
✓ Google Calendar
✓ n8n Integration
✓ Automatic Opportunity Detection
✓ Email → Application
✓ Job Page → Opportunity
```

---

# 🌍 Version 5 — Personal Operating System

The long-term architecture could become:

```text
                    LIFEOS
                       │
        ┌──────────────┼──────────────┐
        │              │              │
     CAREER         PERSONAL       KNOWLEDGE
        │              │              │
    Jobs             Tasks          Notes
    Internships      Reminders      Documents
    Interviews       Calendar       Ideas
    Opportunities    Events         Research
        │              │              │
        └──────────────┼──────────────┘
                       │
                       ▼
                 AI ASSISTANT
                       │
                       ▼
              PERSONAL INTELLIGENCE
```

---

# 🔮 Future Vision

LifeOS should eventually move from:

```text
"Store what I tell you."
```

to:

```text
"Understand what is happening in my digital life
and help me decide what to do next."
```

For example:

```text
Gmail
  ↓
Interview Email

Calendar
  ↓
Interview Tomorrow

Job Application
  ↓
Status = Interview

Profile
  ↓
Weak System Design

AI
  ↓

"Your interview is tomorrow at 11 AM.
Based on the job description, you should
spend 90 minutes reviewing system design
and 60 minutes reviewing Node.js.

I have also prepared 15 likely interview
questions."
```

That is where LifeOS becomes much more than a tracker.

---

# 🏆 Competitive Differentiation

A normal:

```text
Todo App
```

only stores tasks.

A:

```text
Job Tracker
```

only tracks applications.

A:

```text
Password Manager
```

only manages credentials.

A:

```text
Calendar
```

only manages events.

LifeOS combines:

```text
Opportunity Management
        +
Task Management
        +
Reminder Engine
        +
Account Vault
        +
Document Management
        +
Calendar
        +
Knowledge Management
        +
AI
        +
Automation
```

The key differentiator is the **relationship between these entities**.

For example:

```text
Company
  │
  ├── Website
  ├── Account
  ├── Job
  ├── Application
  ├── Interview
  ├── Documents
  ├── Notes
  ├── Tasks
  └── Reminders
```

Everything is connected.

---

# 🧠 Core Product Philosophy

LifeOS should follow five principles:

### 1. Capture Once

The user should enter information only once.

### 2. Remember Automatically

The system should remember deadlines, applications, accounts and commitments.

### 3. Understand Context

The system should understand how different pieces of information are connected.

### 4. Prioritize Automatically

The user should not manually decide what is urgent every morning.

### 5. Take Action

The system should eventually automate repetitive actions.

---

# 🔥 Example Real-Life Scenario

Suppose a student applies to:

```text
20 Jobs
10 Internships
5 Government Exams
4 Scholarships
3 Hackathons
```

Without LifeOS:

```text
Browser History
     +
WhatsApp
     +
Email
     +
Excel
     +
Notes
     +
Memory
```

Result:

```text
Missed Deadline
Missed Interview
Forgot Follow-up
Lost Login
Duplicate Application
Forgot Documents
```

With LifeOS:

```text
                    LIFEOS
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
 Applications      Accounts        Calendar
       │               │               │
       ▼               ▼               ▼
 Deadlines         Credentials      Interviews
       │               │               │
       └───────────────┼───────────────┘
                       ▼
                 AI PRIORITY
                       │
                       ▼
               TODAY'S ACTIONS
```

The user simply opens LifeOS and knows:

> **What matters, what is pending, what is coming next, and what action should be taken.**

---

# 📌 Suggested Product Name

Possible names:

```text
LifeOS
LifeDesk
LifeVault
Opportune
Trackly
RecallOS
FocusOS
Nexora
FlowOS
PersonalOS
CommandOS
```

### Strongest positioning:

**LifeOS — Your Personal Opportunity & Information Command Center**

---

# 🎯 Final Objective

The ultimate goal is not to build another CRUD dashboard.

The goal is to build a system that reduces the user's **mental load**.

Instead of remembering:

```text
What?
When?
Where?
Why?
Which account?
Which website?
Which document?
Which deadline?
What should I do next?
```

the user simply trusts LifeOS to remember it.

> **Your life has too many tabs. LifeOS brings them into one command center.**

---

# 🛠️ Recommended Development Order

```text
Phase 1
Authentication
      ↓
Phase 2
Opportunity CRUD
      ↓
Phase 3
Dashboard
      ↓
Phase 4
Reminder Engine
      ↓
Phase 5
Website Metadata
      ↓
Phase 6
Search + Filters
      ↓
Phase 7
Account Vault
      ↓
Phase 8
Documents + Calendar
      ↓
Phase 9
AI Assistant
      ↓
Phase 10
Email + Browser Extension
      ↓
Phase 11
Automation + Intelligence
```

---

# ⭐ The Most Important MVP Principle

Do not start by building:

```text
AI Agents
Vector Database
Complex Microservices
Browser Extension
Gmail Automation
100+ features
```

Start with one extremely strong loop:

```text
Add Opportunity
       ↓
Automatically identify website
       ↓
Set deadline
       ↓
Set priority
       ↓
Track status
       ↓
Create reminder
       ↓
Show on Today's Dashboard
       ↓
Never miss it
```

If this loop genuinely becomes useful in your own daily life, then add the AI and automation layers.

---

# 📜 License

Choose an appropriate license before publishing the project publicly.

---

# 👨‍💻 Project Status

```text
🚧 MVP in active development (Phase 1-3: Auth, Opportunity CRUD, Dashboard)
```

LifeOS is envisioned as a scalable, security-first, AI-assisted personal information and opportunity management platform.

---

# ❤️ Why LifeOS Exists

Modern digital life creates an unusual problem:

> We have more tools to remember things than ever before, yet we still forget important things.

LifeOS attempts to solve that problem by giving users a single place where their important opportunities, commitments, accounts, deadlines and knowledge can be captured, connected, prioritized and acted upon.

**Capture once. Remember automatically. Act intelligently.**
