# Workspace API

Complete workspace management endpoints for the Flowtim platform.

## 📋 Overview

The workspace API allows users to create, manage, and collaborate within workspaces. Each workspace serves as a container for projects, tasks, members, and resources.

## 🔐 Base URL

```
http://localhost:8000/api/workspace
```

## 📝 Endpoints

### 1. Create New Workspace

Create a new workspace with the authenticated user as the owner.

```http
POST /api/workspace/create/new
```

**Authentication:** Required (Session or JWT)

**Request Body:**
```json
{
  "name": "My Team Workspace",
  "description": "A collaborative workspace for our team projects"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Workspace created successfully",
  "data": {
    "workspace": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "My Team Workspace",
      "description": "A collaborative workspace for our team projects",
      "owner": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://example.com/avatar.jpg"
      },
      "members": [
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
          "name": "John Doe",
          "email": "john@example.com",
          "role": "owner",
          "joinedAt": "2025-10-22T10:30:00.000Z"
        }
      ],
      "settings": {
        "isPublic": false,
        "allowInvites": true,
        "defaultRole": "member"
      },
      "createdAt": "2025-10-22T10:30:00.000Z",
      "updatedAt": "2025-10-22T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400` - Validation error (name required, too long, etc.)
- `429` - Workspace creation limit exceeded

### 2. Get Workspace by ID

Retrieve detailed information about a specific workspace.

```http
GET /api/workspace/{id}
```

**Authentication:** Required (Session or JWT)

**Path Parameters:**
- `id` (string) - Workspace ID

**Response (200):**
```json
{
  "status": "success",
  "message": "Workspace retrieved successfully",
  "data": {
    "workspace": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "My Team Workspace",
      "description": "A collaborative workspace for our team projects",
      "owner": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://example.com/avatar.jpg"
      },
      "members": [
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
          "name": "John Doe",
          "email": "john@example.com",
          "role": "owner",
          "joinedAt": "2025-10-22T10:30:00.000Z",
          "lastActive": "2025-10-22T11:00:00.000Z"
        },
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
          "name": "Jane Smith",
          "email": "jane@example.com",
          "role": "admin",
          "joinedAt": "2025-10-22T10:45:00.000Z",
          "lastActive": "2025-10-22T12:00:00.000Z"
        }
      ],
      "stats": {
        "projectCount": 5,
        "taskCount": 25,
        "memberCount": 8,
        "completedTasks": 18
      },
      "settings": {
        "isPublic": false,
        "allowInvites": true,
        "defaultRole": "member",
        "timezone": "UTC",
        "weekStartsOn": "monday"
      },
      "createdAt": "2025-10-22T10:30:00.000Z",
      "updatedAt": "2025-10-22T11:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `403` - Access denied (not a member)
- `404` - Workspace not found

### 3. Get All User Workspaces

Retrieve all workspaces where the authenticated user is a member.

```http
GET /api/workspace/all
```

**Authentication:** Required (Session or JWT)

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 10)
- `search` (string, optional) - Search workspace names
- `role` (string, optional) - Filter by user role (owner, admin, member)

**Response (200):**
```json
{
  "status": "success",
  "message": "Workspaces retrieved successfully",
  "data": {
    "workspaces": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "name": "My Team Workspace",
        "description": "A collaborative workspace for our team projects",
        "role": "owner",
        "memberCount": 8,
        "projectCount": 5,
        "unreadNotifications": 3,
        "lastActivity": "2025-10-22T12:00:00.000Z",
        "createdAt": "2025-10-22T10:30:00.000Z"
      },
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
        "name": "Client Projects",
        "description": "Workspace for client deliverables",
        "role": "admin",
        "memberCount": 4,
        "projectCount": 3,
        "unreadNotifications": 0,
        "lastActivity": "2025-10-22T09:30:00.000Z",
        "createdAt": "2025-10-20T14:15:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### 4. Update Workspace

Update workspace details and settings.

```http
PUT /api/workspace/update/{id}
```

**Authentication:** Required (Session or JWT)
**Permissions:** Owner or Admin

**Path Parameters:**
- `id` (string) - Workspace ID

**Request Body:**
```json
{
  "name": "Updated Workspace Name",
  "description": "Updated workspace description",
  "settings": {
    "isPublic": false,
    "allowInvites": true,
    "defaultRole": "member",
    "timezone": "America/New_York",
    "weekStartsOn": "sunday"
  }
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Workspace updated successfully",
  "data": {
    "workspace": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "Updated Workspace Name",
      "description": "Updated workspace description",
      "settings": {
        "isPublic": false,
        "allowInvites": true,
        "defaultRole": "member",
        "timezone": "America/New_York",
        "weekStartsOn": "sunday"
      },
      "updatedAt": "2025-10-22T13:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `403` - Insufficient permissions
- `404` - Workspace not found
- `422` - Validation error

### 5. Delete Workspace

Permanently delete a workspace and all its associated data.

```http
DELETE /api/workspace/delete/{id}
```

**Authentication:** Required (Session or JWT)
**Permissions:** Owner only

**Path Parameters:**
- `id` (string) - Workspace ID

**Response (200):**
```json
{
  "status": "success",
  "message": "Workspace deleted successfully",
  "data": {
    "deletedWorkspace": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "Deleted Workspace"
    }
  }
}
```

**Error Responses:**
- `403` - Only workspace owner can delete
- `404` - Workspace not found

### 6. Get Workspace Members

Retrieve all members of a workspace with their roles and details.

```http
GET /api/workspace/members/{id}
```

**Authentication:** Required (Session or JWT)
**Permissions:** Member

**Path Parameters:**
- `id` (string) - Workspace ID

**Query Parameters:**
- `role` (string, optional) - Filter by role (owner, admin, member)
- `search` (string, optional) - Search member names or emails
- `page` (number, optional) - Page number
- `limit` (number, optional) - Items per page

**Response (200):**
```json
{
  "status": "success",
  "message": "Workspace members retrieved successfully",
  "data": {
    "members": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://example.com/avatar.jpg",
        "role": "owner",
        "joinedAt": "2025-10-22T10:30:00.000Z",
        "lastActive": "2025-10-22T12:00:00.000Z",
        "tasksAssigned": 8,
        "tasksCompleted": 6,
        "isOnline": true
      },
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "avatar": "https://example.com/avatar2.jpg",
        "role": "admin",
        "joinedAt": "2025-10-22T10:45:00.000Z",
        "lastActive": "2025-10-22T11:30:00.000Z",
        "tasksAssigned": 5,
        "tasksCompleted": 4,
        "isOnline": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 8,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### 7. Change Member Role

Update the role of a workspace member.

```http
PUT /api/workspace/change/member/role/{id}
```

**Authentication:** Required (Session or JWT)
**Permissions:** Owner or Admin

**Path Parameters:**
- `id` (string) - Workspace ID

**Request Body:**
```json
{
  "memberId": "64f1a2b3c4d5e6f7g8h9i0j3",
  "newRole": "admin"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Member role updated successfully",
  "data": {
    "member": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "admin",
      "roleChangedAt": "2025-10-22T13:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `403` - Insufficient permissions
- `404` - Member or workspace not found
- `422` - Invalid role or cannot change owner role

### 8. Get Workspace Analytics

Retrieve comprehensive analytics and metrics for a workspace.

```http
GET /api/workspace/analytics/{id}
```

**Authentication:** Required (Session or JWT)
**Permissions:** Member

**Path Parameters:**
- `id` (string) - Workspace ID

**Query Parameters:**
- `period` (string, optional) - Time period (7d, 30d, 90d, 1y)
- `metrics` (string, optional) - Specific metrics to include

**Response (200):**
```json
{
  "status": "success",
  "message": "Workspace analytics retrieved successfully",
  "data": {
    "overview": {
      "totalProjects": 5,
      "activeProjects": 3,
      "completedProjects": 2,
      "totalTasks": 25,
      "completedTasks": 18,
      "overdueTasks": 3,
      "totalMembers": 8,
      "activeMembers": 6
    },
    "productivity": {
      "tasksCompletedThisWeek": 12,
      "tasksCompletedThisMonth": 45,
      "averageCompletionTime": 2.5,
      "productivityScore": 85
    },
    "activity": {
      "dailyActivity": [
        {
          "date": "2025-10-22",
          "tasksCompleted": 3,
          "tasksCreated": 2,
          "messages": 15,
          "fileUploads": 1
        }
      ],
      "topContributors": [
        {
          "userId": "64f1a2b3c4d5e6f7g8h9i0j3",
          "name": "Jane Smith",
          "tasksCompleted": 8,
          "contributions": 15
        }
      ]
    },
    "projects": {
      "byStatus": {
        "planning": 1,
        "inProgress": 3,
        "completed": 1
      },
      "byPriority": {
        "low": 2,
        "medium": 2,
        "high": 1
      }
    },
    "members": {
      "byRole": {
        "owner": 1,
        "admin": 2,
        "member": 5
      },
      "byActivity": {
        "veryActive": 3,
        "active": 3,
        "inactive": 2
      }
    },
    "storage": {
      "totalStorage": 2.5,
      "usedStorage": 1.8,
      "availableStorage": 0.7,
      "fileCount": 156
    }
  }
}
```

## 📊 Data Models

### Workspace Object
```json
{
  "_id": "string",
  "name": "string",
  "description": "string",
  "owner": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "avatar": "string"
  },
  "members": [
    {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "owner|admin|member",
      "joinedAt": "string",
      "lastActive": "string"
    }
  ],
  "settings": {
    "isPublic": "boolean",
    "allowInvites": "boolean",
    "defaultRole": "string",
    "timezone": "string",
    "weekStartsOn": "string"
  },
  "stats": {
    "projectCount": "number",
    "taskCount": "number",
    "memberCount": "number",
    "completedTasks": "number"
  },
  "createdAt": "string",
  "updatedAt": "string"
}
```

### Member Object
```json
{
  "_id": "string",
  "name": "string",
  "email": "string",
  "avatar": "string",
  "role": "owner|admin|member",
  "joinedAt": "string",
  "lastActive": "string",
  "tasksAssigned": "number",
  "tasksCompleted": "number",
  "isOnline": "boolean"
}
```

## 🔒 Permissions

### Role-Based Access Control

| Action | Owner | Admin | Member |
|--------|-------|-------|--------|
| View workspace | ✅ | ✅ | ✅ |
| Update workspace | ✅ | ✅ | ❌ |
| Delete workspace | ✅ | ❌ | ❌ |
| Invite members | ✅ | ✅ | ❌ |
| Remove members | ✅ | ✅ | ❌ |
| Change roles | ✅ | ✅* | ❌ |
| View analytics | ✅ | ✅ | ✅ |
| Manage settings | ✅ | ✅ | ❌ |

*Admins cannot change owner role or remove owner

### Subscription Limits

Workspace creation and member management may be limited by subscription plans:

- **Starter**: Up to 5 users, 3 projects
- **Professional**: Up to 25 users, unlimited projects
- **Enterprise**: Unlimited users and projects

## 🚨 Error Handling

### Common Error Responses

**Permission Denied (403):**
```json
{
  "status": "error",
  "message": "You don't have permission to perform this action",
  "error": "INSUFFICIENT_PERMISSIONS",
  "requiredRole": "admin",
  "userRole": "member"
}
```

**Not Found (404):**
```json
{
  "status": "error",
  "message": "Workspace not found",
  "error": "WORKSPACE_NOT_FOUND",
  "workspaceId": "64f1a2b3c4d5e6f7g8h9i0j1"
}
```

**Validation Error (422):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "error": "VALIDATION_ERROR",
  "details": {
    "name": "Workspace name is required",
    "description": "Description too long (max 500 characters)"
  }
}
```

**Subscription Limit (403):**
```json
{
  "status": "error",
  "message": "User limit reached. Upgrade your plan to add more members.",
  "error": "SUBSCRIPTION_LIMIT_EXCEEDED",
  "limit": 5,
  "current": 5
}
```

## 🔄 Real-time Updates

Workspace changes are broadcasted to connected members via WebSocket:

```javascript
// WebSocket events for workspace updates
socket.on('workspace:updated', (data) => {
  // Handle workspace update
});

socket.on('workspace:member:added', (data) => {
  // Handle new member
});

socket.on('workspace:member:removed', (data) => {
  // Handle member removal
});

socket.on('workspace:member:role:changed', (data) => {
  // Handle role change
});
```

## 🧪 Testing

### Example Test Cases
```javascript
describe('Workspace API', () => {
  let workspaceId;

  test('should create workspace', async () => {
    const response = await request(app)
      .post('/api/workspace/create/new')
      .set('Cookie', authCookie)
      .send({
        name: 'Test Workspace',
        description: 'A test workspace'
      })
      .expect(201);

    workspaceId = response.body.data.workspace._id;
    expect(response.body.data.workspace.name).toBe('Test Workspace');
  });

  test('should get workspace details', async () => {
    const response = await request(app)
      .get(`/api/workspace/${workspaceId}`)
      .set('Cookie', authCookie)
      .expect(200);

    expect(response.body.data.workspace._id).toBe(workspaceId);
  });

  test('should update workspace', async () => {
    const response = await request(app)
      .put(`/api/workspace/update/${workspaceId}`)
      .set('Cookie', authCookie)
      .send({
        name: 'Updated Workspace Name'
      })
      .expect(200);

    expect(response.body.data.workspace.name).toBe('Updated Workspace Name');
  });
});
```

## 📱 Client Integration

### React Hook Example
```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await axios.get('/api/workspace/all', {
          withCredentials: true
        });
        setWorkspaces(response.data.data.workspaces);
      } catch (err) {
        setError(err.response.data);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  return { workspaces, loading, error };
}
```

### Vue Composition API
```javascript
import { ref, onMounted } from 'vue';
import api from '@/services/api';

export function useWorkspace(id) {
  const workspace = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const fetchWorkspace = async () => {
    loading.value = true;
    try {
      const response = await api.get(`/workspace/${id}`);
      workspace.value = response.data.data.workspace;
    } catch (err) {
      error.value = err.response.data;
    } finally {
      loading.value = false;
    }
  };

  const updateWorkspace = async (updates) => {
    try {
      const response = await api.put(`/workspace/update/${id}`, updates);
      workspace.value = { ...workspace.value, ...response.data.data.workspace };
      return response.data;
    } catch (err) {
      throw err.response.data;
    }
  };

  onMounted(fetchWorkspace);

  return {
    workspace,
    loading,
    error,
    updateWorkspace,
    refetch: fetchWorkspace
  };
}
```

---

**Related Documentation:**
- [Project API](./PROJECT_API.md)
- [Member API](./MEMBER_API.md)
- [Analytics API](./ANALYTICS_API.md)
- [Main API Documentation](./API_DOCUMENTATION.md)