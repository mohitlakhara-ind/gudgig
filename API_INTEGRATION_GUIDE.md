# API Integration Guide

This document outlines the integration between the frontend UI and backend APIs, including data structures, endpoints, and implementation details.

## Overview

The job portal frontend has been updated to consume live backend data instead of hardcoded values. This integration ensures real-time data display and proper state management across all components.

## Updated Components

### 1. JobsListing Component (`src/components/jobs/JobsListing.tsx`)

**Changes Made:**
- Replaced hardcoded job data with API calls to `/api/jobs`
- Added proper loading, error, and success states
- Implemented real-time search and filtering
- Updated pagination to match backend response structure

**API Integration:**
```typescript
// Fetch jobs with filters
const response: JobsResponse = await apiClient.getJobs({
  query: searchTerm,
  location: selectedLocation,
  category: selectedCategory,
  type: selectedType,
  sort: sort,
  page: currentPage,
  limit: 10
});
```

**Data Flow:**
1. User interacts with search/filter controls
2. Component debounces input (500ms delay)
3. API call made with current filters
4. Response updates jobs list, pagination, and total count
5. UI re-renders with new data

### 2. Dashboard Components

**JobSeekerDashboard (`src/components/dashboard/JobSeekerDashboard.tsx`):**
- Integrated with `/api/stats/jobseeker` for user statistics
- Fetches real applications from `/api/applications`
- Displays recommended jobs from `/api/jobs`

**EmployerDashboard (`src/components/dashboard/EmployerDashboard.tsx`):**
- Integrated with `/api/stats/employer` for employer statistics
- Fetches employer's jobs from `/api/jobs`
- Displays recent applications from `/api/applications`

## Backend API Updates

### Enhanced Job Controller (`backend/src/controllers/jobController.js`)

**Improvements:**
- Enhanced population of related data (employer, company details)
- Added company logo, description, website, industry, size, headquarters, and rating
- Improved response structure for frontend consumption

**Response Structure:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "job_id",
      "title": "Software Engineer",
      "description": "Job description...",
      "company": {
        "_id": "company_id",
        "name": "Tech Corp",
        "logo": "https://example.com/logo.png",
        "description": "Company description...",
        "website": "https://techcorp.com",
        "industry": "Technology",
        "size": "51-200",
        "headquarters": "San Francisco, CA",
        "rating": 4.5
      },
      "employer": {
        "_id": "employer_id",
        "name": "John Doe",
        "avatar": "https://example.com/avatar.jpg",
        "email": "john@techcorp.com"
      },
      "salary": {
        "min": 80000,
        "max": 120000,
        "currency": "USD",
        "period": "yearly",
        "isNegotiable": true
      },
      "featured": true,
      "urgent": false,
      "views": 150,
      "applicationsCount": 25,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 10,
  "total": 250,
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 25
  }
}
```

## API Endpoints

### Jobs API

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/jobs` | GET | Get jobs with filtering and pagination | No |
| `/api/jobs/:id` | GET | Get single job details | No |
| `/api/jobs` | POST | Create new job | Yes (Employer) |
| `/api/jobs/:id` | PUT | Update job | Yes (Owner/Admin) |
| `/api/jobs/:id` | DELETE | Delete job | Yes (Owner/Admin) |
| `/api/jobs/stats/overview` | GET | Get job statistics | Yes (Employer/Admin) |

### Applications API

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/applications` | GET | Get user's applications | Yes |
| `/api/applications` | POST | Create new application | Yes |
| `/api/applications/:id` | PUT | Update application status | Yes (Employer) |
| `/api/applications/:id/withdraw` | PUT | Withdraw application | Yes (Applicant) |

### Statistics API

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/stats/jobseeker` | GET | Get job seeker statistics | Yes (Job Seeker) |
| `/api/stats/employer` | GET | Get employer statistics | Yes (Employer) |
| `/api/stats/admin` | GET | Get admin statistics | Yes (Admin) |

## Data Types and Interfaces

### Updated TypeScript Interfaces

```typescript
// Updated JobsResponse to match backend
export interface JobsResponse {
  success: boolean;
  data: Job[];
  count: number;
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Enhanced Job interface with populated company data
export interface Job {
  _id: string;
  title: string;
  description: string;
  company: Company; // Now populated object instead of just ID
  employer: User; // Now populated object instead of just ID
  salary: SalaryInfo;
  featured: boolean;
  urgent: boolean;
  views: number;
  applicationsCount: number;
  createdAt: string;
  // ... other fields
}
```

## State Management

### Loading States
All components now implement proper loading states:
```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState<string | null>(null);
```

### Error Handling
Consistent error handling across all API calls:
```typescript
try {
  const response = await apiClient.getJobs(params);
  // Handle success
} catch (err) {
  setError(err instanceof ApiClientError ? err.message : 'Failed to fetch jobs');
} finally {
  setLoading(false);
}
```

## Frontend Features

### 1. Real-time Search and Filtering
- Debounced search input (500ms delay)
- Dynamic category and location filtering
- Sort options (recent, salary, company, match)
- Pagination with load more functionality

### 2. Dynamic Statistics
- Live job counts and market insights
- User-specific dashboard statistics
- Real-time application tracking

### 3. Enhanced Job Cards
- Company logos and information
- Salary ranges with currency formatting
- Application counts and view statistics
- Featured and urgent job badges

### 4. Responsive Design
- Mobile-optimized layouts
- Progressive loading with skeletons
- Smooth animations and transitions

## Performance Optimizations

### 1. API Optimizations
- Pagination to limit data transfer
- Selective field population
- Efficient database queries with indexes

### 2. Frontend Optimizations
- Debounced search to reduce API calls
- Loading states to improve perceived performance
- Error boundaries for graceful error handling

### 3. Caching Strategy
- API client with built-in caching
- Optimistic updates for better UX
- Refresh token handling for seamless authentication

## Security Considerations

### 1. Authentication
- JWT token-based authentication
- Refresh token rotation
- Role-based access control

### 2. Data Validation
- Input validation on both frontend and backend
- SQL injection prevention
- XSS protection

### 3. Rate Limiting
- API rate limiting to prevent abuse
- Job posting limits per employer
- Search query throttling

## Testing Strategy

### 1. Unit Tests
- Component testing with React Testing Library
- API client testing with mock responses
- Utility function testing

### 2. Integration Tests
- End-to-end user flows
- API endpoint testing
- Database integration testing

### 3. Performance Tests
- Load testing for API endpoints
- Frontend performance monitoring
- Database query optimization

## Deployment Considerations

### 1. Environment Variables
```env
NEXT_PUBLIC_API_URL=https://api.jobportal.com
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
```

### 2. Build Optimization
- Next.js production build
- Static asset optimization
- API route optimization

### 3. Monitoring
- Error tracking with Sentry
- Performance monitoring
- API usage analytics

## Future Enhancements

### 1. Real-time Features
- WebSocket integration for live updates
- Real-time notifications
- Live chat between employers and candidates

### 2. Advanced Search
- Elasticsearch integration
- AI-powered job matching
- Saved search alerts

### 3. Analytics
- User behavior tracking
- Conversion funnel analysis
- A/B testing framework

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Check API_URL environment variable
   - Verify backend server is running
   - Check network connectivity

2. **Authentication Issues**
   - Verify JWT token validity
   - Check refresh token expiration
   - Ensure proper role permissions

3. **Data Loading Issues**
   - Check API response format
   - Verify TypeScript interfaces match backend
   - Check for CORS issues

### Debug Tools

1. **Browser DevTools**
   - Network tab for API calls
   - Console for error messages
   - React DevTools for component state

2. **Backend Logs**
   - API request/response logs
   - Database query logs
   - Error stack traces

3. **Monitoring Tools**
   - Application performance monitoring
   - Error tracking and alerting
   - User session recordings

## Conclusion

The frontend-backend integration provides a robust, scalable foundation for the job portal application. The implementation ensures real-time data display, proper error handling, and optimal user experience while maintaining security and performance standards.

For additional support or questions, refer to the API documentation or contact the development team.