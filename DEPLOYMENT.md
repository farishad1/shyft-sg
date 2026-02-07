# Shyft SG - Deployment Guide

This document contains all the information needed to deploy Shyft SG to production.

---

## Environment Variables

Create a `.env` file with the following variables:

### Required

```bash
# Database (Neon PostgreSQL recommended)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# NextAuth.js Configuration
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-super-secret-key-at-least-32-chars"

# Application
NODE_ENV="production"
```

### Optional

```bash
# Email (for future notifications)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASSWORD=""

# File Storage (for document uploads)
S3_BUCKET=""
S3_ACCESS_KEY=""
S3_SECRET_KEY=""
S3_REGION=""
```

---

## Database Setup

### 1. Push Schema to Production Database

```bash
npx prisma db push
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Seed Production Database (Creates Admin User)

```bash
npx prisma db seed
```

> **Important:** The seed script ONLY creates the Super Admin account:
> - **Email:** `abeerfaris@shyft.sg`
> - **Password:** `v%£T9LZrE3£cS:*E0`
> 
> No demo data is created. The database will be clean for production.

---

## Build & Deploy

### Local Build

```bash
npm run build
npm start
```

### Vercel Deployment

1. Link repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy will run automatically on push

### Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Post-Deployment Checklist

- [ ] Verify admin can log in at `/auth/login`
- [ ] Access admin dashboard at `/admin`
- [ ] Verify `/admin/verifications` page loads (even if empty)
- [ ] Verify `/admin/hotels` page loads (will be empty)
- [ ] Verify `/admin/messages` page loads (will be empty)
- [ ] Test hotel registration flow
- [ ] Test worker registration with SMS verification (mock code: `123456`)
- [ ] Verify map shows "No Active Shifts Nearby" when empty

---

## Admin Credentials

| Email | Password |
|-------|----------|
| `abeerfaris@shyft.sg` | `v%£T9LZrE3£cS:*E0` |

---

## Key Routes

### Public
- `/` - Landing page
- `/auth/login` - Login
- `/auth/register` - Registration

### Worker (after verification)
- `/dashboard` - Worker dashboard
- `/dashboard/shifts` - Find shifts (with map)
- `/dashboard/schedule` - My shifts
- `/dashboard/history` - Past work

### Hotel (after verification)
- `/hotel` - Hotel dashboard
- `/hotel/jobs` - Manage shifts
- `/hotel/roster` - View roster

### Admin
- `/admin` - Admin dashboard
- `/admin/verifications` - Verify users
- `/admin/hotels` - Manage hotels
- `/admin/messages` - Contact requests
- `/admin/users` - User management
- `/admin/financials` - Financial overview

---

## Technology Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Auth:** NextAuth.js
- **Maps:** Leaflet (OpenStreetMap tiles)
- **Styling:** Custom CSS (no Tailwind)

---

## Support

For technical issues, contact the development team.
