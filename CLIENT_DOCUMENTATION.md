# Job Portal - Client Documentation

## Overview
A full‑stack job/gigs portal with admin and freelancer experiences. It includes jobs (aka gigs), bids, services marketplace, orders, messaging (chat), notifications, and admin management (users, bids, settings, analytics).

## Environments & URLs
- Frontend (Next.js): `http://localhost:3000` (local) | Production: [job-portal-preview.vercel.app](https://job-portal-preview.vercel.app/)
- Backend (Express/MongoDB): `http://localhost:5000` (local) | Production API base: [job-portal-b2fu.onrender.com](https://job-portal-b2fu.onrender.com/)
- API base (local): `http://localhost:5000/api`

Configure these via env vars:
- Frontend: `NEXT_PUBLIC_BACKEND_URL` (e.g., `http://localhost:5000`), `NEXT_PUBLIC_API_URL` (default `/api`)
- Backend: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET`

Production config examples:
- Frontend env: `NEXT_PUBLIC_BACKEND_URL=https://job-portal-b2fu.onrender.com` and `NEXT_PUBLIC_API_URL=/api`
- Backend deployed at: `https://job-portal-b2fu.onrender.com` (APIs under `/api`)

## Authentication
- Email/password with JWT and refresh tokens
- OTP helpers (email/SMS) included
- Roles: `admin`, `freelancer`, `employer`

## Seeded Sample Users (login)
- Admin
  - email: `admin@gigsmint.com`
  - password: `Admin123!`
- Freelancers
  - `alice@gigsmint.com` / `Freelancer123!`
  - `bob@gigsmint.com` / `Freelancer123!`
  - `carol@gigsmint.com` / `Freelancer123!`
  - plus additional freelancers created by the seeder
- Employers
  - `john@techcorp.com` / `Employer123!`
  - `sarah@designagency.com` / `Employer123!`
  - plus additional employers created by the seeder

Seeder script: `backend/src/seeders/seedDatabase.js`

## Frontend App (Next.js)
- Admin
  - Manage Gigs: `src/app/admin/gigs/page.tsx`
    - Lists gigs with bids count; create/edit/delete gigs
  - Bid Management: `src/app/admin/bids/page.tsx`
    - Review bids; Accept/Reject integrated with backend `PATCH /admin/bids/:id/status`
  - User Management: `src/app/admin/users/page.tsx`, `src/app/admin/users/[id]/page.tsx`
    - List/filter users; activate/deactivate (duration), promote/demote roles
  - Admin Chat
    - List: `src/app/admin/chat/page.tsx` (supports `?userId=` auto-start)
    - Conversation: `src/app/admin/chat/[id]/page.tsx` (topbar shows opponent)
- Users (Freelancer/Employer)
  - Gigs listing/details: `src/app/gigs/[id]/page.tsx`
  - Place bid flow: `src/components/ui/place-bid-modal.tsx` (shows bid fee options and job bids count)
  - User Chat: `src/app/(dashboard)/chat/page.tsx` and `[id]/page.tsx`

Shared utilities:
- API client: `src/lib/api.ts` (auth, gigs, bids, chat, users, etc.)
- Socket: `src/lib/socket`
- Auth context: `src/contexts/AuthContext`

## Backend App (Express)
- Entry: `backend/src/server.js`
- Key Routes (mounted under `/api`):
  - Auth: `/auth`
  - Jobs (gigs alias): `/jobs`, `/gigs`
  - Bids: `/bids`, Admin bids: `/admin/bids`
  - Admin: `/admin` (users, analytics)
  - Chat: `/chat` (conversations/messages)
  - Services, Orders, Reviews, Profiles, Notifications, Applications

### Notable Endpoints
- Jobs
  - GET `/jobs` — lists jobs with `bidsCount`
  - GET `/jobs/:jobId` — job details
  - GET `/jobs/:jobId/bids/count` — total succeeded bids for a job
  - Admin POST/PUT/DELETE `/jobs` and `/jobs/:jobId` — manage gigs
- Bids
  - POST `/bids` — submit bid (with payment enforcement)
  - GET `/gigs/:jobId/bids` — admin list bids for a job (user populated)
  - Admin GET `/admin/bids` — paginated bids list
  - Admin PATCH `/admin/bids/:bidId/status` — accept/reject selection
- Chat
  - GET `/chat?userId=...` — admin can filter by user
  - POST `/chat` — start/reuse 1:1 conversation
  - GET `/chat/:id` — conversation details with populated participants
  - GET `/chat/:id/messages` — list messages
  - POST `/chat/:id/messages` — send
  - PUT `/chat/:id/read` — mark read
- Admin Users
  - GET `/admin/users` — list with filters/search
  - GET `/admin/users/:userId` — details
  - PUT `/admin/users/:userId` — update (name/email/role/isActive)
  - PUT `/admin/users/:userId/status` — activate/deactivate (duration/until)
  - DELETE `/admin/users/:userId` — soft delete

## Data Models Seeded
- Users (admins, freelancers, employers)
- Jobs (7 categories + extra)
- AdminSettings (bid fee options)
- FreelancerProfile (for first few freelancers)
- Services (marketplace offerings)
- Bids (mix of succeeded/pending/failed)
- Orders
- Applications
- Reviews
- Conversations + messages
- Notifications

Refer to: `backend/src/seeders/seedDatabase.js` for exact sample payloads.

## Typical Flows
- Place Bid (Freelancer)
  1) Open a gig, use “Place Bid” (or modal) to set quotation/proposal
  2) Pay the current bid fee (mocked)
  3) Backend validates payment, records bid (paymentStatus `succeeded`)
  4) Admin sees bid in Bid Management and can Accept/Reject

- Admin Accept/Reject Bid
  1) Admin opens Bid Management
  2) Click Accept/Reject → `PATCH /admin/bids/:id/status`
  3) System updates bid selection state and emits notifications

- Admin Chat Initiation
  1) Visit `/admin/chat?userId=<targetId>` — auto creates/rehydrates 1:1 conversation and redirects to `/admin/chat/{conversationId}`

## Configuration Notes
- CSRF token is automatically fetched via `/api/auth/csrf-token` in browser for state‑changing calls
- Next.js rewrites proxy `/api/*` to backend API base; see `next.config.ts`
- Socket.io connects to backend for realtime chat/notifications

## Testing Logins Quickly
- Admin: `admin@gigsmint.com` / `Admin123!`
- Freelancer: `alice@gigsmint.com` / `Freelancer123!`
- Employer: `john@techcorp.com` / `Employer123!`

## Support
- Health: `GET http://localhost:5000/health`
- Metrics (dev): `GET http://localhost:5000/metrics`

If you need any environment‑specific instructions (Docker, seed scripts, or deployment), see `README.md`, `ENVIRONMENT_SETUP.md`, and `DEPLOYMENT.md` in the project root.
