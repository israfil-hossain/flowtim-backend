# Flowtim API Endpoints Summary

Complete list of all available API endpoints in the Flowtim platform.

## 📋 Overview

This document provides a comprehensive summary of all API endpoints available in the Flowtim backend, organized by functional modules.

## 🌐 Base URL

**Development:** `http://localhost:8000/api`
**Production:** `https://your-domain.com/api`

## 🔐 Authentication

Most endpoints require authentication. Use session cookies or JWT tokens.

## 📚 API Modules

### 1. Authentication Module (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | User login | ❌ |
| POST | `/auth/logout` | User logout | ✅ |
| GET | `/auth/validate` | Validate session | ✅ |
| POST | `/auth/refresh` | Refresh JWT token | ✅ |
| GET | `/auth/google` | Google OAuth login | ❌ |
| GET | `/auth/google/callback` | Google OAuth callback | ❌ |
| GET | `/auth/google/callback/success` | OAuth success page | ❌ |
| GET | `/auth/google/callback/failure` | OAuth failure page | ❌ |

### 2. User Management Module (`/user`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/user/current` | Get current user profile | ✅ |
| GET | `/user/profile` | Get user profile details | ✅ |
| PUT | `/user/update` | Update user profile | ✅ |
| POST | `/user/avatar` | Upload user avatar | ✅ |
| GET | `/user/preferences` | Get user preferences | ✅ |
| PUT | `/user/preferences` | Update user preferences | ✅ |
| GET | `/user/notifications` | Get user notifications | ✅ |
| PUT | `/user/notifications/read` | Mark notifications as read | ✅ |
| GET | `/user/activity` | Get user activity log | ✅ |

### 3. Workspace Management Module (`/workspace`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/workspace/create/new` | Create new workspace | ✅ |
| GET | `/workspace/all` | Get user workspaces | ✅ |
| GET | `/workspace/{id}` | Get workspace by ID | ✅ |
| PUT | `/workspace/update/{id}` | Update workspace | ✅ |
| DELETE | `/workspace/delete/{id}` | Delete workspace | ✅ |
| GET | `/workspace/members/{id}` | Get workspace members | ✅ |
| PUT | `/workspace/change/member/role/{id}` | Change member role | ✅ |
| GET | `/workspace/analytics/{id}` | Get workspace analytics | ✅ |

### 4. Project Management Module (`/project`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/project/workspace/{workspaceId}/create` | Create project | ✅ |
| GET | `/project/workspace/{workspaceId}/all` | Get workspace projects | ✅ |
| GET | `/project/{projectId}/workspace/{workspaceId}` | Get project by ID | ✅ |
| PUT | `/project/{projectId}/workspace/{workspaceId}/update` | Update project | ✅ |
| DELETE | `/project/{projectId}/workspace/{workspaceId}/delete` | Delete project | ✅ |
| GET | `/project/{projectId}/workspace/{workspaceId}/analytics` | Get project analytics | ✅ |
| GET | `/project/{projectId}/workspace/{workspaceId}/members` | Get project members | ✅ |
| POST | `/project/{projectId}/workspace/{workspaceId}/duplicate` | Duplicate project | ✅ |
| GET | `/project/templates` | Get project templates | ✅ |

### 5. Task Management Module (`/task`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/task/project/{projectId}/workspace/{workspaceId}/create` | Create task | ✅ |
| GET | `/task/workspace/{workspaceId}/all` | Get workspace tasks | ✅ |
| GET | `/task/{taskId}/workspace/{workspaceId}` | Get task by ID | ✅ |
| PUT | `/task/{taskId}/project/{projectId}/workspace/{workspaceId}/update` | Update task | ✅ |
| DELETE | `/task/{taskId}/workspace/{workspaceId}/delete` | Delete task | ✅ |
| GET | `/task/{taskId}/comments` | Get task comments | ✅ |
| POST | `/task/{taskId}/comments` | Add task comment | ✅ |
| GET | `/task/{taskId}/attachments` | Get task attachments | ✅ |
| POST | `/task/{taskId}/attachments` | Upload task attachment | ✅ |
| GET | `/task/{taskId}/subtasks` | Get task subtasks | ✅ |
| POST | `/task/{taskId}/subtasks` | Create subtask | ✅ |
| GET | `/task/{taskId}/time-log` | Get task time logs | ✅ |
| POST | `/task/{taskId}/time-log` | Add time log entry | ✅ |
| PUT | `/task/workspace/{workspaceId}/bulk-update` | Bulk update tasks | ✅ |

### 6. Subtask Management Module (`/subtasks`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/subtasks/{subtaskId}` | Get subtask by ID | ✅ |
| PUT | `/subtasks/{subtaskId}` | Update subtask | ✅ |
| DELETE | `/subtasks/{subtaskId}` | Delete subtask | ✅ |
| POST | `/subtasks/{subtaskId}/complete` | Mark subtask complete | ✅ |
| POST | `/subtasks/{subtaskId}/reopen` | Reopen subtask | ✅ |

### 7. Member Management Module (`/member`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/member/invite` | Invite member to workspace | ✅ |
| GET | `/member/workspace/{inviteCode}/join` | Join workspace via invite | ❌ |
| POST | `/member/workspace/{inviteCode}/join` | Confirm workspace join | ✅ |
| DELETE | `/member/{memberId}/workspace/{workspaceId}/remove` | Remove member from workspace | ✅ |
| PUT | `/member/{memberId}/workspace/{workspaceId}/role` | Update member role | ✅ |
| GET | `/member/{memberId}/profile` | Get member profile | ✅ |

### 8. File Management Module (`/files`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/files/upload` | Upload file | ✅ |
| GET | `/files/{fileId}/download` | Download file | ✅ |
| DELETE | `/files/{fileId}/delete` | Delete file | ✅ |
| GET | `/files/list` | List files | ✅ |
| POST | `/files/{fileId}/share` | Share file | ✅ |
| GET | `/files/{fileId}/info` | Get file info | ✅ |
| PUT | `/files/{fileId}/rename` | Rename file | ✅ |

### 9. Document Management Module (`/document`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/document/workspace/{workspaceId}` | Get workspace documents | ✅ |
| POST | `/document/workspace/{workspaceId}/create` | Create document | ✅ |
| GET | `/document/{documentId}` | Get document by ID | ✅ |
| PUT | `/document/{documentId}` | Update document | ✅ |
| DELETE | `/document/{documentId}` | Delete document | ✅ |
| POST | `/document/{documentId}/collaborate` | Add collaborator | ✅ |
| GET | `/document/{documentId}/versions` | Get document versions | ✅ |
| POST | `/document/{documentId}/versions` | Create new version | ✅ |

### 10. Chat Module (`/chat`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/chat/workspace/{workspaceId}/channels` | Get workspace channels | ✅ |
| POST | `/chat/workspace/{workspaceId}/channels` | Create channel | ✅ |
| GET | `/chat/channel/{channelId}/messages` | Get channel messages | ✅ |
| POST | `/chat/channel/{channelId}/messages` | Send message | ✅ |
| PUT | `/chat/message/{messageId}` | Update message | ✅ |
| DELETE | `/chat/message/{messageId}` | Delete message | ✅ |
| POST | `/chat/message/{messageId}/react` | React to message | ✅ |
| GET | `/chat/direct/{userId}` | Get direct messages | ✅ |
| POST | `/chat/direct/{userId}` | Send direct message | ✅ |

### 11. Kanban Module (`/kanban`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/kanban/workspace/{workspaceId}/boards` | Get kanban boards | ✅ |
| POST | `/kanban/workspace/{workspaceId}/boards` | Create kanban board | ✅ |
| GET | `/kanban/board/{boardId}` | Get kanban board by ID | ✅ |
| PUT | `/kanban/board/{boardId}` | Update kanban board | ✅ |
| DELETE | `/kanban/board/{boardId}` | Delete kanban board | ✅ |
| POST | `/kanban/board/{boardId}/columns` | Create column | ✅ |
| PUT | `/kanban/column/{columnId}` | Update column | ✅ |
| DELETE | `/kanban/column/{columnId}` | Delete column | ✅ |
| POST | `/kanban/column/{columnId}/cards` | Create card | ✅ |
| PUT | `/kanban/card/{cardId}` | Update card | ✅ |
| DELETE | `/kanban/card/{cardId}` | Delete card | ✅ |
| PUT | `/kanban/card/{cardId}/move` | Move card between columns | ✅ |

### 12. Analytics Module (`/analytics`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/analytics/dashboard/{workspaceId}` | Get dashboard analytics | ✅ |
| GET | `/analytics/productivity/{workspaceId}` | Get productivity metrics | ✅ |
| GET | `/analytics/team-performance/{workspaceId}` | Get team performance | ✅ |
| GET | `/analytics/project-insights/{projectId}` | Get project insights | ✅ |
| POST | `/analytics/custom-reports` | Create custom report | ✅ |
| GET | `/analytics/custom-reports` | Get custom reports | ✅ |
| GET | `/analytics/export/{workspaceId}` | Export analytics data | ✅ |
| GET | `/analytics/time-tracking/{workspaceId}` | Get time tracking data | ✅ |

### 13. Notifications Module (`/notifications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/notifications` | Get user notifications | ✅ |
| POST | `/notifications/{notificationId}/read` | Mark notification as read | ✅ |
| POST | `/notifications/mark-all-read` | Mark all notifications as read | ✅ |
| GET | `/notifications/settings` | Get notification settings | ✅ |
| PUT | `/notifications/settings` | Update notification settings | ✅ |
| POST | `/notifications/subscribe` | Subscribe to notifications | ✅ |
| POST | `/notifications/unsubscribe` | Unsubscribe from notifications | ✅ |
| POST | `/notifications/send` | Send notification (Admin) | ✅ |

### 14. Templates Module (`/templates`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/templates` | Get available templates | ✅ |
| GET | `/templates/{templateId}` | Get template by ID | ✅ |
| POST | `/templates` | Create template | ✅ |
| PUT | `/templates/{templateId}` | Update template | ✅ |
| DELETE | `/templates/{templateId}` | Delete template | ✅ |
| POST | `/templates/{templateId}/use` | Use template for project | ✅ |
| GET | `/templates/categories` | Get template categories | ✅ |
| GET | `/templates/category/{category}` | Get templates by category | ✅ |

### 15. Automation Module (`/automations`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/automations/workspace/{workspaceId}` | Get workspace automations | ✅ |
| POST | `/automations/workspace/{workspaceId}` | Create automation | ✅ |
| GET | `/automations/{automationId}` | Get automation by ID | ✅ |
| PUT | `/automations/{automationId}` | Update automation | ✅ |
| DELETE | `/automations/{automationId}` | Delete automation | ✅ |
| POST | `/automations/{automationId}/enable` | Enable automation | ✅ |
| POST | `/automations/{automationId}/disable` | Disable automation | ✅ |
| POST | `/automations/{automationId}/test` | Test automation | ✅ |
| GET | `/automations/triggers` | Get available triggers | ✅ |
| GET | `/automations/actions` | Get available actions | ✅ |
| GET | `/automations/logs/{automationId}` | Get automation logs | ✅ |

### 16. Admin Module (`/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/users` | Get all users (Admin) | ✅ (Admin) |
| GET | `/admin/users/{userId}` | Get user by ID (Admin) | ✅ (Admin) |
| PUT | `/admin/users/{userId}` | Update user (Admin) | ✅ (Admin) |
| DELETE | `/admin/users/{userId}` | Delete user (Admin) | ✅ (Admin) |
| GET | `/admin/workspaces` | Get all workspaces (Admin) | ✅ (Admin) |
| GET | `/admin/workspaces/{workspaceId}` | Get workspace by ID (Admin) | ✅ (Admin) |
| PUT | `/admin/workspaces/{workspaceId}` | Update workspace (Admin) | ✅ (Admin) |
| DELETE | `/admin/workspaces/{workspaceId}` | Delete workspace (Admin) | ✅ (Admin) |
| GET | `/admin/analytics` | Get admin analytics | ✅ (Admin) |
| GET | `/admin/settings` | Get admin settings | ✅ (Admin) |
| PUT | `/admin/settings` | Update admin settings | ✅ (Admin) |
| GET | `/admin/billing` | Get billing overview | ✅ (Admin) |
| GET | `/admin/audit-logs` | Get audit logs | ✅ (Admin) |

### 17. Pricing Module (`/pricing`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/pricing/plans` | Get all pricing plans | ❌ |
| GET | `/pricing/plans/{planId}` | Get pricing plan by ID | ❌ |
| GET | `/pricing/comparison` | Get pricing comparison | ❌ |
| POST | `/pricing/plans` | Create pricing plan | ✅ (Admin) |
| PUT | `/pricing/plans/{planId}` | Update pricing plan | ✅ (Admin) |
| DELETE | `/pricing/plans/{planId}` | Delete pricing plan | ✅ (Admin) |

### 18. Subscription Module (`/subscription`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/subscription/workspace/{workspaceId}` | Get workspace subscription | ✅ |
| GET | `/subscription/all` | Get all user subscriptions | ✅ |
| POST | `/subscription/create` | Create subscription | ✅ |
| GET | `/subscription/{subscriptionId}` | Get subscription by ID | ✅ |
| PUT | `/subscription/{subscriptionId}` | Update subscription | ✅ |
| POST | `/subscription/{subscriptionId}/cancel` | Cancel subscription | ✅ |
| POST | `/subscription/{subscriptionId}/reactivate` | Reactivate subscription | ✅ |
| GET | `/subscription/workspace/{workspaceId}/limits` | Get workspace limits | ✅ |
| POST | `/subscription/workspace/{workspaceId}/check-users` | Check user limit | ✅ |
| POST | `/subscription/workspace/{workspaceId}/check-projects` | Check project limit | ✅ |

### 19. Payment Module (`/payment`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/payment/history` | Get payment history | ✅ |
| GET | `/payment/stats` | Get payment statistics | ✅ |
| GET | `/payment/{paymentId}` | Get payment by ID | ✅ |
| POST | `/payment/refund/{paymentId}` | Process refund | ✅ (Admin) |
| GET | `/payment/invoice/{invoiceId}` | Get invoice details | ✅ |
| POST | `/payment/method` | Add payment method | ✅ |
| GET | `/payment/methods` | Get payment methods | ✅ |
| DELETE | `/payment/method/{methodId}` | Remove payment method | ✅ |

### 20. Stripe Webhooks Module (`/stripe`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/stripe/webhook` | Handle Stripe webhooks | ❌ (Webhook) |

### 21. System Module

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | ❌ |
| GET | `/` | API root information | ❌ |
| GET | `/api-docs` | Swagger documentation | ❌ |

## 🚦 HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## 🔒 Authentication Types

| Type | Description |
|------|-------------|
| ❌ | No authentication required |
| ✅ | User authentication required |
| ✅ (Admin) | Admin authentication required |
| ❌ (Webhook) | Webhook signature verification |

## 📝 Response Format

All endpoints follow a consistent response format:

### Success Response
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

### Error Response
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

## 🚀 Quick Start Examples

### Login and Get Workspaces
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email": "user@example.com", "password": "password"}'

# Get workspaces
curl -X GET http://localhost:8000/api/workspace/all \
  -b cookies.txt
```

### Create Project
```bash
curl -X POST http://localhost:8000/api/project/workspace/{workspaceId}/create \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name": "New Project", "description": "Project description"}'
```

### Get Pricing Plans
```bash
curl -X GET http://localhost:8000/api/pricing/plans
```

## 📚 Detailed Documentation

For detailed information about each module, see the individual API documentation files:

- [Authentication API](./AUTHENTICATION_API.md)
- [User Management API](./USER_API.md)
- [Workspace Management API](./WORKSPACE_API.md)
- [Project Management API](./PROJECT_API.md)
- [Task Management API](./TASK_API.md)
- [Kanban API](./KANBAN_API.md)
- [Chat API](./CHAT_API.md)
- [File Management API](./FILE_API.md)
- [Analytics API](./ANALYTICS_API.md)
- [Notifications API](./NOTIFICATION_API.md)
- [Automation API](./AUTOMATION_API.md)
- [Templates API](./TEMPLATE_API.md)
- [Admin API](./ADMIN_API.md)
- [Pricing & Subscription API](./PRICING_API.md)
- [Payment API](./PAYMENT_API.md)
- [Webhook API](./WEBHOOK_API.md)

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2025-10-22 | Initial API documentation |

---

**Last Updated:** October 22, 2025
**Total Endpoints:** 150+
**API Version:** v1.0.0