# Flowtim API Documentation

Complete API documentation for the Flowtim project management and collaboration platform.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Base URL](#api-base-url)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [API Endpoints](#api-endpoints)

## 🌐 Overview

The Flowtim API provides RESTful endpoints for managing workspaces, projects, tasks, users, and subscription billing. It uses JWT-based authentication and follows REST principles.

## 🔑 Authentication

Most API endpoints require authentication using session cookies or JWT tokens.

### Authentication Methods:
- **Session-based**: Automatic session management via cookies
- **JWT Bearer Token**: Include `Authorization: Bearer <token>` header
- **Google OAuth**: `/auth/google` endpoints for OAuth authentication

### Required Headers:
```http
Content-Type: application/json
Authorization: Bearer <jwt_token> (if using JWT)
Cookie: connect.sid=<session_id> (if using sessions)
```

## 🌐 API Base URL

**Development:** `http://localhost:8000/api`
**Production:** `https://your-domain.com/api`

## 📊 Response Format

### Success Response:
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "pagination": { // For paginated endpoints
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Response:
```json
{
  "status": "error",
  "message": "Error description",
  "error": "ERROR_CODE",
  "details": {
    // Additional error details
  }
}
```

## ⚠️ Error Handling

### HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

### Common Error Codes:
- `VALIDATION_ERROR` - Input validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `ALREADY_EXISTS` - Resource already exists
- `RATE_LIMIT_EXCEEDED` - Too many requests

## 🚦 Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Authentication endpoints**: 5 requests per minute
- **General endpoints**: 100 requests per minute
- **File uploads**: 10 requests per minute

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🛠️ API Endpoints

### Core Modules:

1. **[Authentication](./docs/AUTHENTICATION_API.md)**
   - User registration, login, logout
   - Session management
   - Google OAuth integration

2. **[User Management](./docs/USER_API.md)**
   - Profile management
   - User preferences
   - Activity tracking

3. **[Workspace Management](./docs/WORKSPACE_API.md)**
   - Create, read, update, delete workspaces
   - Member management
   - Workspace analytics

4. **[Project Management](./docs/PROJECT_API.md)**
   - Project CRUD operations
   - Project templates
   - Project analytics

5. **[Task Management](./docs/TASK_API.md)**
   - Task CRUD operations
   - Subtask management
   - Task assignments

6. **[Kanban Boards](./docs/KANBAN_API.md)**
   - Board management
   - Column operations
   - Card management

7. **[Chat & Communication](./docs/CHAT_API.md)**
   - Real-time messaging
   - Channel management
   - Message history

8. **[File Management](./docs/FILE_API.md)**
   - File upload/download
   - File sharing
   - Storage management

9. **[Analytics & Reports](./docs/ANALYTICS_API.md)**
   - Workspace analytics
   - Productivity metrics
   - Custom reports

10. **[Notifications](./docs/NOTIFICATION_API.md)**
    - Push notifications
    - Email notifications
    - Notification preferences

11. **[Automations](./docs/AUTOMATION_API.md)**
    - Workflow automations
    - Trigger management
    - Action execution

12. **[Templates](./docs/TEMPLATE_API.md)**
    - Project templates
    - Task templates
    - Template library

13. **[Admin Panel](./docs/ADMIN_API.md)**
    - User management
    - System settings
    - Administrative analytics

14. **[Pricing & Subscriptions](./docs/PRICING_API.md)**
    - Pricing plans
    - Subscription management
    - Billing history

15. **[Payment Processing](./docs/PAYMENT_API.md)**
    - Payment processing
    - Invoice management
    - Refund handling

16. **[Webhooks](./docs/WEBHOOK_API.md)**
    - Stripe webhooks
    - Event handling
    - Webhook management

## 🔧 Development Tools

### Swagger UI
Interactive API documentation available at:
`http://localhost:8000/api-docs`

### Postman Collection
Import the provided Postman collection for easy API testing.

### Health Check
```http
GET /health
```

Returns API health status and basic system information.

## 📝 Examples

### Making an Authenticated Request

```javascript
// Using fetch
const response = await fetch('http://localhost:8000/api/workspace/all', {
  method: 'GET',
  credentials: 'include', // For session-based auth
  headers: {
    'Content-Type': 'application/json',
    // Or for JWT: 'Authorization': 'Bearer <token>'
  }
});

const data = await response.json();
console.log(data);
```

### Error Handling

```javascript
try {
  const response = await fetch('/api/workspace/create/new', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'My Workspace',
      description: 'A great workspace'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  const data = await response.json();
  console.log('Workspace created:', data.data);
} catch (error) {
  console.error('Error:', error.message);
}
```

## 🔄 Versioning

The API uses semantic versioning. Current version: **v1.0.0**

### Version Changes:
- **v1.0.0** - Initial release with core functionality
- Future versions will maintain backward compatibility

## 📞 Support

For API support and questions:
- **Documentation:** This guide and individual API docs
- **Swagger UI:** Interactive testing at `/api-docs`
- **Issues:** Report bugs and feature requests via GitHub
- **Email:** support@flowtim.com

## 🚀 Getting Started

1. **Set up environment:**
   ```bash
   cd flowtim-backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

4. **Test the API:**
   - Visit `http://localhost:8000/api-docs` for Swagger UI
   - Use the provided Postman collection
   - Make test requests using curl or your preferred client

## 📚 Additional Resources

- [Environment Setup Guide](./ENVIRONMENT_SETUP.md)
- [API Quick Reference](./API_QUICK_REFERENCE.md)
- [Swagger Documentation](http://localhost:8000/api-docs)
- [Postman Collection](./postman-collection.json)

---

**Last Updated:** October 22, 2025
**API Version:** v1.0.0