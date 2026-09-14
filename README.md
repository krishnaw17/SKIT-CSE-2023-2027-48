# GLMS: Gamified Learning Management System

![GLMS Demo](https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop)

GLMS is a premium, full-stack Learning Management System designed to make learning addictive through gamification. Built for the modern classroom, it combines powerful academic tools with engaging mechanics like XP, levels, badges, streaks, and leaderboards.

## Features

- **Core Academics**: Classes, subjects, courses, lessons, and assignments.
- **Interactive Quizzes**: Auto-grading, manual grading, multiple attempts, and timed sessions.
- **Gamification Engine**: Event-driven XP allocation, rule-based badges, dynamic leveling, and streak tracking.
- **Dashboards**: Dedicated analytics for Students, Teachers, and Admins using Recharts.
- **Animations**: Premium, GSAP-powered landing page and reward popups.
- **Enterprise-Ready**: Role-based access control, strict Zod validation, JWT with refresh tokens, and comprehensive audit logs.

## Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS, GSAP, Recharts, Zustand, React Query
- **Backend**: Node.js, Express, Prisma ORM, Zod, JWT
- **Database**: PostgreSQL (Supabase)
- **Monorepo**: pnpm workspaces

## Getting Started

### Prerequisites

- Node.js v20+
- pnpm v8+
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd project
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` in `apps/server` and fill in your database credentials and JWT secret.
   ```bash
   cp apps/server/.env.example apps/server/.env
   ```

4. Run database migrations:
   ```bash
   cd apps/server
   pnpm run prisma:generate
   pnpm run prisma:migrate
   ```

5. Start the development servers:
   ```bash
   # From root
   pnpm --filter @glms/server run dev
   pnpm --filter @glms/web run dev
   ```

## Folder Structure

- `apps/web`: React frontend
- `apps/server`: Express backend
- `packages/shared`: Shared types and Zod schemas
- `docs/`: Architecture and ER diagrams

## Documentation

- [ER Diagram](./docs/ER_DIAGRAM.md)

## License

MIT License
