# Pohlman Protean Task Manager

A kanban‑style task manager built with Next.js (App Router) and Supabase, featuring authentication, drag‑and‑drop task management, customer/project scoping, and hierarchical tasks (parent/child).

## Tech Stack
- Next.js 15 (App Router)
- React 19
- TypeScript
- NextAuth.js (Credentials + Google)
- Supabase (Postgres + Auth client)
- Tailwind CSS
- react-dnd
- Nodemailer (email verification)

## Getting Started
1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` with the following variables (examples):
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_USER=your_smtp_user@example.com
EMAIL_PASS=your_smtp_app_password
```

3. Run the dev server:
```bash
npm run dev
```
Open http://localhost:3000

## Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run prettier`: Format with Prettier

## Data Model (high level)
- `User`: application users
- `Customer`: customers a user can access (via `CustomerUser` join)
- `Project`: projects under a customer
- `Task`: tasks with fields like `title`, `content`, `priority`, `status`, `customerId`, `projectId`, `parentId`, timestamps, and optional `subtasks`/`parent` relations
- `CustomerUser`: join table for user ↔ customer access

## Key Features
- Authentication via NextAuth.js
  - Credentials login (email/password)
  - Google OAuth
  - Optional email verification via `/api/verify`
- Customer & Project scoping
  - Only tasks for selected customer/project are shown
  - Selected customer/project are persisted in localStorage so refresh keeps your selection
- Kanban board
  - Columns by status (NOT_STARTED, WIP, WAITING, CLOSED)
  - Drag‑and‑drop to change status
  - Sorting per column
- Tasks
  - Create tasks with priority, status, parent (optional)
  - Edit tasks: title, content, priority, solution
  - Parent/Child relations
    - Choose parent in the task modal (cycle‑safe)
    - Add/remove child tasks from the task modal

## App Structure (selected)
- `src/app/layout.tsx`: App wrapper, metadata and viewport
- `src/app/components/workSpace.tsx`: Main kanban view, selection, persistence
- `src/app/components/taskCard.tsx`: Task card + modal trigger
- `src/app/components/modals/newTaskModal.tsx`: Create task form
- `src/app/components/modals/taskModal.tsx`: View/edit task, parent/child management
- `src/lib/supaBase.ts`: Supabase client
- `src/lib/supabaseTasks.ts`: Task/customer/project data helpers

## API Endpoints (pages/api)
- Auth
  - `GET/POST /api/auth/[...nextauth]` (NextAuth.js)
  - `POST /api/login` (credentials helper, not required if using NextAuth’s credentials flow)
  - `GET /api/verify?token=...` (email verification)
- Data
  - `GET /api/task` → list tasks
  - `POST /api/task` → create task
  - `PUT /api/task` → update task (including `parentId`)
  - `DELETE /api/task` → delete task
  - `GET /api/customer?userId=...` → customers for a user
  - `GET /api/filtertaskoncustomer?customer=NAME[&project=TITLE]` → tasks for a customer, optional project

Notes:
- `filtertaskoncustomer` treats empty or unknown project as no results instead of 500 errors.
- Customer/project selections are persisted per user locally (localStorage keys `pp.selectedCustomer` and `pp.selectedProject:{customer}`).

## Environment & Configuration
- Supabase: set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- NextAuth: set `NEXTAUTH_SECRET`, optionally Google OAuth vars
- Email verification: set `EMAIL_USER` and `EMAIL_PASS` for your SMTP provider (Gmail example in code)

## Development Tips
- If you see an “EPIPE: broken pipe” during build, it’s a benign message related to an MCP stdio transport. The build completes; you can ignore it.
- To reset your local branch to remote:
```bash
git fetch origin --prune
git reset --hard origin/dev
git clean -fd
```

## Roadmap Ideas
- Searchable assignee selection & avatars
- URL‑based customer/project (shareable links)
- User‑level preferences persisted in DB
- Role‑based access per project

## License
MIT (or your preferred license)
