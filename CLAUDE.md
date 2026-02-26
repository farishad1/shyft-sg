# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Development server (port 3000)
npm run build        # prisma generate + next build
npm run start        # Production server
npm run lint         # ESLint
npx prisma studio    # Database GUI
npx prisma db seed   # Seed database with admin + demo hotels
npx prisma migrate dev --name <name>  # Create and apply a migration
```

## Architecture

**Stack:** Next.js 16 (App Router), TypeScript, Prisma 7, Neon PostgreSQL, NextAuth v5 beta, Tailwind CSS 4, Zod 4

**Source layout:** All code lives under `src/`. Path alias `@/` maps to `src/`.

### Role-Based Access

Three roles — `WORKER`, `HOTEL`, `ADMIN` — with entirely separate dashboards:
- `/dashboard/*` — Workers only
- `/hotel/*` — Hotels only
- `/admin/*` — Admins only
- `/messages` — Cross-role direct messaging

Route protection is enforced in `src/auth.config.ts` via the NextAuth `authorized` callback, which inspects `auth.user.role` against the requested path. No middleware file is needed separately.

### Auth

- `src/lib/auth.ts` — NextAuth configuration (Credentials provider, 30-day sessions)
- `src/lib/auth.config.ts` — Route guards and redirect logic
- `src/lib/auth-utils.ts` — bcrypt helpers (12 salt rounds)
- Session extends the default type to include `id` and `role`

### Database

Prisma singleton in `src/lib/prisma.ts` prevents connection pool exhaustion. Build always runs `prisma generate` first.

**Key models and relationships:**
- `User` → `WorkerProfile` | `HotelProfile` | `AdminProfile` (one-to-one by role)
- `JobPosting` (hotel creates) → `Application` (worker applies) → `Shift` (accepted = confirmed work)
- `Shift` carries the two-way rating system; both parties rate after completion
- `Conversation` + `Message` handle direct messaging and admin support chats

**Business rules encoded in constants (`src/lib/constants.ts`):**
- Tiers (SILVER/GOLD/PLATINUM) auto-calculated from cumulative hours in `src/lib/tiers.ts`
- Workers: strikes at 2 warnings, ban at 5; 24-hour cancellation rule; 12-hour application lock
- Minors (< 16): no night shifts (11 PM–6 AM), max 6-hour shifts; minimum registration age 13

### Key Libraries

- `src/lib/validations.ts` — All Zod schemas (registration, profiles, job postings)
- `src/lib/geocoding.ts` — OpenStreetMap/Nominatim geocoding for shift map
- `src/lib/storage.ts` — File/document upload utilities
- Leaflet + React-Leaflet for the shift-finding map in `/dashboard/shifts`
- Recharts for admin financials charts

### Prisma Schema Enums

```
Role: ADMIN | WORKER | HOTEL
VerificationStatus: PENDING | VERIFIED | DECLINED
ApplicationStatus: PENDING | ACCEPTED | DECLINED | COMPLETED | CANCELLED
Tier: SILVER | GOLD | PLATINUM
WorkPassType: CITIZEN_PR | EMPLOYMENT_PASS | S_PASS | WORK_PERMIT | DEPENDENT_PASS_LTVP | STUDENT_PASS | TEMPORARY_EMPLOYMENT_PASS | PROFESSIONAL_VISIT_PASS | OTHER
```

### Branding Constants

Background `#000000`, gold accent `#EFBF04`, white text `#FFFFFF`. Keep UI consistent with this palette.

## Production Deployment

- App runs via PM2 (`shyft-sg` process, port 3000), proxied through Nginx
- After code changes: `npm run build && pm2 restart shyft-sg`
- Environment: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` required
- See `DEPLOYMENT.md` for full server setup instructions
