## Testing Guide

### Overview
- Backend: Jest + Supertest
- Frontend: Jest + React Testing Library
- E2E: Playwright

### Backend (Jest)
- Location: `backend/src/tests/*`
- Run: `cd backend && npm test`
- Coverage: `backend/coverage` (text, lcov, json)

### Frontend (RTL)
- Config: `jest.frontend.config.js`
- Setup: `jest.setup.ts`
- Sample: `src/components/__tests__/SampleComponent.test.tsx`
- Run: `npm run test:frontend`

### E2E (Playwright)
- Config: `playwright.config.ts`
- Tests: `e2e/*.spec.ts`
- Run: `npm run test:e2e`

### Combined
- `npm run test` runs frontend + backend unit tests.

