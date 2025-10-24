# Authentication API

Complete authentication and session management endpoints for the Flowtim platform.

## 📋 Overview

The authentication API handles user registration, login, logout, session management, and OAuth integration. It supports both session-based authentication and JWT tokens.

## 🔐 Base URL

```
http://localhost:8000/api/auth
```

## 📝 Endpoints

### 1. Register New User

Register a new user account with email and password.

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": null,
      "role": "user",
      "isActive": true,
      "createdAt": "2025-10-22T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400` - Validation error (invalid email, weak password)
- `409` - Email already exists

### 2. User Login

Authenticate user with email and password.

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "role": "user"
    },
    "workspace": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Default Workspace",
      "description": "Your personal workspace"
    }
  }
}
```

**Error Responses:**
- `400` - Invalid credentials
- `401` - Account not activated
- `404` - User not found

### 3. Logout User

End the current user session.

```http
POST /api/auth/logout
```

**Authentication:** Required (Session or JWT)

**Response (200):**
```json
{
  "status": "success",
  "message": "Logout successful"
}
```

### 4. Validate Session

Check if the current session is valid and get user information.

```http
GET /api/auth/validate
```

**Authentication:** Required (Session or JWT)

**Response (200):**
```json
{
  "status": "success",
  "message": "Session is valid",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "role": "user"
    },
    "workspace": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Default Workspace"
    }
  }
}
```

**Error Responses:**
- `401` - Invalid or expired session

### 5. Refresh Token

Generate new access token using refresh token.

```http
POST /api/auth/refresh
```

**Authentication:** Required (Refresh Token)

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

### 6. Google OAuth Login

Initiate Google OAuth authentication flow.

```http
GET /api/auth/google
```

**Query Parameters:**
- `redirect_uri` (optional) - Custom redirect URL after authentication

**Response:** Redirects to Google OAuth consent screen

### 7. Google OAuth Callback

Handle Google OAuth callback after user consent.

```http
GET /api/auth/google/callback
```

**Authentication:** Handled by OAuth flow

**Response:** Redirects to frontend with authentication status

### 8. Google OAuth Success/Failure Pages

#### Success
```http
GET /api/auth/google/callback/success
```

**Response:** HTML page confirming successful authentication

#### Failure
```http
GET /api/auth/google/callback/failure
```

**Response:** HTML page showing authentication failure

## 🔧 Authentication Methods

### 1. Session-Based Authentication

Automatic session management using HTTP-only cookies.

**Usage:**
```javascript
// Login response sets session cookie automatically
fetch('/api/auth/login', {
  method: 'POST',
  credentials: 'include', // Important for session cookies
  body: JSON.stringify({ email, password })
});

// Subsequent requests include session automatically
fetch('/api/workspace/all', {
  credentials: 'include'
});
```

### 2. JWT Token Authentication

Bearer token authentication for stateless clients.

**Usage:**
```javascript
// Login to get JWT token
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { data } = await response.json();
const token = data.accessToken;

// Use token for subsequent requests
fetch('/api/workspace/all', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 📊 Session Management

### Session Data Structure
```json
{
  "userId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "email": "john@example.com",
  "role": "user",
  "loginTime": "2025-10-22T10:30:00.000Z",
  "lastActivity": "2025-10-22T11:00:00.000Z"
}
```

### Session Configuration
- **Duration:** 7 days (configurable)
- **Secure:** HTTPS only in production
- **HttpOnly:** Not accessible via JavaScript
- **SameSite:** Lax for CSRF protection

## 🔒 Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Rate Limiting
- **Login attempts:** 5 per minute per IP
- **Registration:** 3 per minute per IP
- **Password reset:** 5 per hour per email

### Session Security
- Automatic session invalidation on password change
- Session timeout after inactivity
- Secure cookie configuration
- CSRF protection

## 🚨 Error Handling

### Authentication Errors
```json
{
  "status": "error",
  "message": "Invalid credentials",
  "error": "INVALID_CREDENTIALS",
  "code": 401
}
```

### Validation Errors
```json
{
  "status": "error",
  "message": "Validation failed",
  "error": "VALIDATION_ERROR",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  },
  "code": 400
}
```

### Session Errors
```json
{
  "status": "error",
  "message": "Session expired",
  "error": "SESSION_EXPIRED",
  "code": 401
}
```

## 🔄 Google OAuth Integration

### Setup Requirements
1. Create Google Cloud project
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs
5. Configure environment variables

### Environment Variables
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback
```

### OAuth Flow
1. User clicks "Login with Google"
2. Redirect to Google OAuth consent screen
3. User grants permissions
4. Google redirects to callback URL
5. Exchange authorization code for tokens
6. Create/update user account
7. Establish session

## 📱 Client Integration Examples

### React with Axios
```javascript
import axios from 'axios';

// Configure axios for session cookies
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true
});

// Login
const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Check session
const validateSession = async () => {
  try {
    const response = await api.get('/auth/validate');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
```

### Vue.js with Fetch
```javascript
// Authentication composable
export function useAuth() {
  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  };

  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
  };

  return { login, logout };
}
```

## 🧪 Testing

### Unit Test Example
```javascript
describe('Auth API', () => {
  test('should register new user', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.data.user.email).toBe(userData.email);
  });

  test('should login user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
      .expect(200);

    expect(response.body.data.user.email).toBe('test@example.com');
  });
});
```

### Postman Collection
```json
{
  "info": {
    "name": "Flowtim Auth API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/auth/register",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "register"]
        }
      }
    }
  ]
}
```

---

**Related Documentation:**
- [User Management API](./USER_API.md)
- [Workspace API](./WORKSPACE_API.md)
- [Main API Documentation](./API_DOCUMENTATION.md)