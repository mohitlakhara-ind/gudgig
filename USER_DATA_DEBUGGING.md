# User Data Loading Debug Guide

## 🔍 **Debugging Tools Added**

### 1. **API Routes for Testing**
- `/api/auth/me` - Proxy to backend auth/me endpoint
- `/api/debug/user` - Debug endpoint with detailed logging
- `/api/health` - Backend health check

### 2. **Debug Component**
- `UserDataDebug` component added to dashboard
- Shows auth state, localStorage status, and API responses
- Tests both direct API calls and API client methods

### 3. **Enhanced Logging**
- Added console logs to API client request method
- Added debugging to getCurrentUser method
- Fixed double JSON parsing issue in request method

## 🚀 **How to Test**

### **Step 1: Start the Backend**
```bash
cd job-portal/backend
npm start
# or
node src/server.js
```

### **Step 2: Start the Frontend**
```bash
cd job-portal
npm run dev
```

### **Step 3: Test User Data Loading**

1. **Go to Dashboard**: Navigate to `/dashboard`
2. **Check Debug Panel**: You'll see the UserDataDebug component
3. **Test Backend Health**: Click "Check Backend Health" button
4. **Test User Data**: Click "Test User Data Fetch" button
5. **Check Console**: Open browser dev tools to see detailed logs

## 🔧 **Common Issues & Solutions**

### **Issue 1: Backend Not Running**
**Symptoms**: Health check fails, 503 errors
**Solution**: 
- Ensure backend is running on port 5000
- Check `NEXT_PUBLIC_BACKEND_URL` environment variable
- Verify backend health endpoint at `http://localhost:5000/health`

### **Issue 2: CORS Errors**
**Symptoms**: CORS policy errors in console
**Solution**:
- Check backend CORS configuration
- Ensure frontend URL is whitelisted
- Verify preflight requests are handled

### **Issue 3: Token Issues**
**Symptoms**: 401 Unauthorized errors
**Solution**:
- Check if token exists in localStorage
- Verify token format (Bearer token)
- Check token expiration
- Test token refresh mechanism

### **Issue 4: Network Errors**
**Symptoms**: TypeError, fetch failed
**Solution**:
- Check network connectivity
- Verify backend URL is correct
- Check if backend is accessible from frontend

## 📊 **Debug Information**

The debug component shows:

### **Auth State**
- `isLoading`: Whether auth is still loading
- `isAuthenticated`: Whether user is authenticated
- `user`: Current user object
- `token`: Current auth token

### **Local Storage**
- `token`: Stored auth token
- `user`: Cached user data
- `role`: Cached user role

### **API Responses**
- Backend health status
- User data fetch results
- Error messages and status codes

## 🐛 **Troubleshooting Steps**

1. **Check Backend Health First**
   - Click "Check Backend Health"
   - Should show "OK" status
   - If fails, backend is not running

2. **Check Authentication State**
   - Look at "Auth State" section
   - Verify user and token are present
   - Check if `isLoading` is stuck on true

3. **Test API Calls**
   - Click "Test User Data Fetch"
   - Check console for detailed logs
   - Look for error messages

4. **Check Network Tab**
   - Open browser dev tools
   - Go to Network tab
   - Look for failed requests
   - Check request/response headers

## 🔧 **Environment Variables**

Make sure these are set correctly:

```env
# Frontend (.env.local)
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api

# Backend (.env)
NODE_ENV=development
PORT=5000
JWT_SECRET=your-jwt-secret
```

## 📝 **Expected Behavior**

### **Successful User Data Loading**
1. Backend health check returns "OK"
2. Auth state shows user as authenticated
3. User data is fetched and displayed
4. No errors in console

### **Failed User Data Loading**
1. Check backend health first
2. Verify authentication state
3. Check for specific error messages
4. Test API calls manually

## 🚨 **Common Error Messages**

- **"No authorization header"**: Token not being sent
- **"Network error"**: Backend not accessible
- **"401 Unauthorized"**: Invalid or expired token
- **"CORS policy"**: Cross-origin request blocked
- **"TypeError: fetch failed"**: Network connectivity issue

Use these debugging tools to identify and fix user data loading issues!


