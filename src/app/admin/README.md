Admin Dashboard Documentation
=============================

Overview
--------

The admin section provides an interface for administrators to manage the job portal. It includes dashboards, user and job management, bid management, messaging, settings, and analytics.

Pages and Routes
----------------

| Route | Page | Status | Description |
|-------|------|--------|-------------|
| /admin | Dashboard | ✅ Complete | Main admin dashboard with overview stats |
| /admin/users | User Management | ⚠️ Partial | User list and management (backend API needed) |
| /admin/jobs | Job Management | ✅ Complete | Manage all jobs posted on the platform |
| /admin/bids | Bid Management | ✅ Complete | View and manage all bids |
| /admin/bid-fees | Bid Fee Config | ✅ Complete | Configure bid fee options |
| /admin/analytics | Analytics | ✅ Complete | Detailed analytics dashboard |
| /admin/settings | Settings | ✅ Complete | General admin settings |
| /admin/chat | Messages | ✅ Complete | Admin messaging interface |
| /admin/login | Admin Login | ✅ Complete | Admin authentication page |

Authentication and Authorization
--------------------------------

- All admin routes are protected by the admin layout. Unauthenticated users are redirected to the login page.
- Only users with `role='admin'` may access admin pages.
- See `src/app/admin/layout.tsx` for the guard and redirect logic.

Layout and Navigation
---------------------

- The layout consists of a sidebar and main content area, with a responsive design.
- Navigation menu items are defined in the layout and `src/config/navigation.ts`.
- The sidebar is hidden on mobile and visible on desktop.

API Integration
---------------

- Admin pages use the shared API client at `src/lib/api.ts`.
- Available endpoints include admin stats, bid fees, bids, and chat.
- User management endpoints are pending and documented below.

Pending Implementation
----------------------

User Management Backend
~~~~~~~~~~~~~~~~~~~~~~~

- The users page UI is implemented but requires backend APIs for listing and updating users.
- See `backend/ADMIN_API_REQUIREMENTS.md` for the complete specification.
- Expected endpoints:
  - GET `/api/admin/users`
  - GET `/api/admin/users/:userId`
  - PUT `/api/admin/users/:userId`
  - PUT `/api/admin/users/:userId/status`
  - DELETE `/api/admin/users/:userId`

Future Enhancements
-------------------

- Charts and visualizations for analytics (integrate a charting library).
- Advanced filtering and search capabilities.
- Bulk operations for user and job management.
- Export functionality for reports.
- Real-time notifications for admin actions.
- Audit log viewer.

Development Guidelines
----------------------

- Admin pages are client components using React state with loading/error handling.
- Follow patterns from existing pages for UI and state management.
- Styling uses Tailwind CSS with primary color `#0966C2` for key accents.

Testing
-------

- Test admin pages while logged in as an admin user.
- Verify authentication redirects and role checks.

Related Files
-------------

- Layout: `src/app/admin/layout.tsx`
- Navigation config: `src/config/navigation.ts`
- API client: `src/lib/api.ts`
- Type definitions: `src/types/api.ts`
- Auth context: `src/contexts/AuthContext.tsx`






