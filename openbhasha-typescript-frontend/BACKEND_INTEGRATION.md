# Frontend-Backend Connection Guide

## Overview

This document explains how the TypeScript frontend connects to the Node.js backend API.

## Backend API Structure

### Authentication (Cookie-based)

The backend uses HTTP-only cookies for authentication instead of JWT tokens in localStorage.

**Auth Endpoints:**

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh authentication
- `GET /api/auth/verify` - Verify current session
- `GET /api/auth/me` - Get current user data
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

**Dashboard Endpoints:**

- `GET /api/auth/admin/dashboard` - Admin dashboard data
- `GET /api/auth/student/dashboard` - Student dashboard data
- `GET /api/auth/reviewer/dashboard` - Reviewer dashboard data
- `GET /api/auth/participant/dashboard` - Participant dashboard data

### User Registration Payload

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "securePassword123",
  "role": "student",
  "college": "University Name",
  "age": 25,
  "gender": "Male",
  "native": "City, State",
  "language": ["English", "Hindi"],
  "dialects": ["Mumbai Hindi"],
  "accent": ["Native speaker"]
}
```

### User Response Structure

```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "college": "University Name",
    "phone": "+1234567890",
    "age": 25,
    "gender": "Male",
    "native": "City, State",
    "language": ["English", "Hindi"],
    "dialects": ["Mumbai Hindi"],
    "accent": ["Native speaker"]
  },
  "redirectTo": "/student/dashboard"
}
```

## Frontend Configuration

### API Client Setup

The `apiClient` is configured for cookie-based authentication:

- **Base URL:** `http://localhost:5000`
- **Credentials:** `withCredentials: true` (for cookies)
- **No Authorization headers** (cookies handled automatically)

### Key Files Updated:

1. **`src/config/api.ts`** - API endpoints configuration
2. **`src/services/apiClient.ts`** - HTTP client with cookie support
3. **`src/services/dashboardService.ts`** - Dashboard data service
4. **`src/hooks/useAuth.ts`** - Authentication hook
5. **`src/hooks/useDashboard.ts`** - Dashboard data hook
6. **`src/types/auth.ts`** - Updated User interface

### Environment Variables

Create `.env` file in frontend root:

```
VITE_API_BASE_URL=http://localhost:5000
```

## Starting the Application

### 1. Start Backend Server

```bash
cd OpenBhasa-main
npm install
npm start
# Server runs on http://localhost:5000
```

### 2. Start Frontend Development Server

```bash
cd openbhasha-typescript-frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

## Connection Testing

### Automatic Testing

Run connection test in browser console:

```javascript
import { ConnectionTest } from "./src/services/connectionTest";

// Test all connections
ConnectionTest.runFullTest().then((results) => {
  console.log("Test Results:", results);
});
```

### Manual Testing

1. **Backend Health Check:** Visit `http://localhost:5000/`

   - Should return: `{"message": "Authentication API is running"}`

2. **CORS Check:** Open browser dev tools, check for CORS errors

   - Should allow `http://localhost:5173` origin

3. **Cookie Test:** Login via frontend, check Application > Cookies
   - Should see `accessToken` and `refreshToken` cookies

## Integration Points

### Authentication Flow

1. User submits login/register form
2. Frontend calls API with `withCredentials: true`
3. Backend sets HTTP-only cookies
4. Frontend stores user data in localStorage
5. Subsequent requests include cookies automatically

### Dashboard Data Flow

1. `useDashboard` hook calls appropriate dashboard endpoint
2. Backend returns role-specific data
3. Frontend updates component state
4. UI renders with backend data

### Error Handling

- **401 Unauthorized:** Automatic token refresh attempt
- **403 Forbidden:** Role-based access denial
- **500 Server Error:** User-friendly error messages
- **Network Error:** Offline/connection status

## Troubleshooting

### Common Issues

**1. CORS Errors**

- Ensure backend allows `http://localhost:5173`
- Check `credentials: true` in frontend requests

**2. Cookie Issues**

- Verify `sameSite: 'none'` and `secure: false` for development
- Check browser cookie settings

**3. Authentication Failures**

- Clear localStorage and cookies
- Verify backend JWT secrets are set
- Check user exists in database

**4. API Endpoint Errors**

- Verify endpoint paths match backend routes
- Check HTTP methods (GET/POST/PUT/DELETE)
- Validate request payload structure

### Development Tips

**Frontend Debugging:**

```javascript
// Check authentication state
console.log("Auth:", useAuth());

// Check API client state
console.log("User:", apiClient.getStoredUser());
console.log("Authenticated:", apiClient.isAuthenticated());

// Test specific endpoint
apiClient.verifyToken().then(console.log);
```

**Backend Debugging:**

```javascript
// Check cookies in request
console.log("Cookies:", req.cookies);

// Check authenticated user
console.log("User:", req.user);
```

## Production Deployment

### Environment Variables

**Frontend (.env.production):**

```
VITE_API_BASE_URL=https://your-backend-domain.com
```

**Backend (.env):**

```
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com
JWT_SECRET=your-secure-jwt-secret
JWT_REFRESH_SECRET=your-secure-refresh-secret
```

### Security Considerations

- Use HTTPS in production (`secure: true` cookies)
- Set proper `sameSite` cookie policies
- Configure proper CORS origins
- Use strong JWT secrets (32+ characters)
- Enable rate limiting on auth endpoints

This setup provides a robust, secure connection between the TypeScript frontend and Node.js backend with proper authentication, error handling, and role-based access control.
