Admin User Management API Requirements
=====================================

Overview
--------

The frontend admin users page (`src/app/admin/users/page.tsx`) and API client methods (`src/lib/api.ts`) are prepared for user management but require backend API implementation.

Required Endpoints
------------------

1. GET /api/admin/users

- Description: Retrieve paginated list of all users with filtering
- Query Parameters:
  - page (number, optional, default: 1)
  - limit (number, optional, default: 20)
  - role (string, optional: 'freelancer' | 'admin')
  - isActive (boolean, optional)
  - search (string, optional: search by name or email)
  - sort (string, optional: 'createdAt' | 'name' | 'lastLogin')
- Response format:
  {
    "success": true,
    "data": {
      "users": [User],
      "total": number,
      "page": number,
      "pages": number,
      "limit": number
    }
  }
- Authentication: Required (admin only)
- Authorization: Admin role required

2. GET /api/admin/users/:userId

- Description: Get detailed information about a specific user
- Path Parameters: userId (string)
- Response: User object with full details
- Authentication: Required (admin only)

3. PUT /api/admin/users/:userId

- Description: Update user information
- Path Parameters: userId (string)
- Request Body: Partial User object (name, email, role, etc.)
- Response: Updated User object
- Authentication: Required (admin only)
- Validation: Ensure email uniqueness, role validity

4. PUT /api/admin/users/:userId/status

- Description: Toggle user active/inactive status
- Path Parameters: userId (string)
- Request Body: { isActive: boolean }
- Response: Updated User object
- Authentication: Required (admin only)
- Business Logic: Prevent admin from deactivating themselves

5. DELETE /api/admin/users/:userId

- Description: Soft delete or permanently delete a user
- Path Parameters: userId (string)
- Response: Success message
- Authentication: Required (admin only)
- Business Logic: Prevent admin from deleting themselves, handle cascading deletes (jobs, bids, etc.)

Implementation Guidelines
-------------------------

- Create new controller: `backend/src/controllers/adminUserController.js`
- Create new route file: `backend/src/routes/adminUsers.js`
- Use existing auth middleware from `backend/src/middleware/auth.js`
- Use authorize middleware to restrict to admin role
- Implement proper error handling
- Add input validation using express-validator
- Log all admin actions for audit trail

Security Considerations
-----------------------

- Ensure only admins can access these endpoints
- Validate all input data
- Prevent privilege escalation
- Log all user management actions
- Implement rate limiting for these endpoints
- Sanitize user input to prevent injection attacks

Database Considerations
-----------------------

- User model exists at `backend/src/models/User.js`
- Ensure indexes on email, role, isActive
- Consider soft delete (isDeleted flag)
- Handle cascading operations for user deletion

Testing Requirements
--------------------

- Unit tests for controller methods
- Integration tests for API endpoints
- Test authentication and authorization
- Test pagination and filtering
- Test edge cases (deleting self, invalid IDs, etc.)

Example Implementation Snippet
------------------------------

Route setup (pseudocode):

```js
// backend/src/routes/adminUsers.js
const router = require('express').Router();
const { auth, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/adminUserController');

router.use(auth, authorize('admin'));
router.get('/users', ctrl.listUsers);
router.get('/users/:userId', ctrl.getUser);
router.put('/users/:userId', ctrl.updateUser);
router.put('/users/:userId/status', ctrl.toggleStatus);
router.delete('/users/:userId', ctrl.deleteUser);

module.exports = router;
```

Controller structure (pseudocode):

```js
// backend/src/controllers/adminUserController.js
exports.listUsers = async (req, res, next) => { /* ... */ };
exports.getUser = async (req, res, next) => { /* ... */ };
exports.updateUser = async (req, res, next) => { /* ... */ };
exports.toggleStatus = async (req, res, next) => { /* ... */ };
exports.deleteUser = async (req, res, next) => { /* ... */ };
```

Integration Steps
-----------------

- Mount the routes in `backend/src/server.js`:

```js
app.use('/api/admin', require('./routes/adminUsers'));
```

- Test endpoints with Postman
- Enable frontend API client methods in `src/lib/api.ts`
- Verify end-to-end in `src/app/admin/users/page.tsx`






