# Project Management API

Complete project management endpoints for the Flowtim platform.

## 📋 Overview

The project API allows users to create, manage, and organize projects within workspaces. It includes project CRUD operations, member management, analytics, and template functionality.

## 🔐 Base URL

```
http://localhost:8000/api/project
```

## 📝 Endpoints

### 1. Create New Project

Create a new project within a workspace.

```http
POST /api/project/workspace/{workspaceId}/create
```

**Authentication:** Required (Session or JWT)

**Path Parameters:**
- `workspaceId` (string) - Workspace ID

**Request Body:**
```json
{
  "name": "Q4 Marketing Campaign",
  "description": "Q4 2025 marketing initiatives and campaigns",
  "status": "planning",
  "priority": "high",
  "startDate": "2025-10-01T00:00:00.000Z",
  "endDate": "2025-12-31T23:59:59.000Z",
  "budget": 50000,
  "currency": "USD",
  "tags": ["marketing", "Q4", "campaign"],
  "templateId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "settings": {
    "isPublic": false,
    "allowGuestAccess": true,
    "defaultView": "kanban",
    "timeTrackingEnabled": true
  },
  "customFields": [
    {
      "name": "Campaign Type",
      "type": "select",
      "options": ["Digital", "Print", "Social Media", "Email"],
      "required": true
    }
  ]
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Project created successfully",
  "data": {
    "project": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Q4 Marketing Campaign",
      "description": "Q4 2025 marketing initiatives and campaigns",
      "workspace": "64f1a2b3c4d5e6f7g8h9i0j3",
      "owner": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://example.com/avatar.jpg"
      },
      "status": "planning",
      "priority": "high",
      "startDate": "2025-10-01T00:00:00.000Z",
      "endDate": "2025-12-31T23:59:59.000Z",
      "budget": 50000,
      "currency": "USD",
      "tags": ["marketing", "Q4", "campaign"],
      "progress": 0,
      "settings": {
        "isPublic": false,
        "allowGuestAccess": true,
        "defaultView": "kanban",
        "timeTrackingEnabled": true
      },
      "customFields": [
        {
          "name": "Campaign Type",
          "type": "select",
          "options": ["Digital", "Print", "Social Media", "Email"],
          "required": true,
          "value": null
        }
      ],
      "stats": {
        "taskCount": 0,
        "completedTasks": 0,
        "memberCount": 1,
        "timeSpent": 0
      },
      "createdAt": "2025-10-22T10:30:00.000Z",
      "updatedAt": "2025-10-22T10:30:00.000Z"
    }
  }
}
```

### 2. Get Workspace Projects

Retrieve all projects within a workspace with filtering and pagination.

```http
GET /api/project/workspace/{workspaceId}/all
```

**Authentication:** Required (Session or JWT)

**Path Parameters:**
- `workspaceId` (string) - Workspace ID

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 10)
- `status` (string, optional) - Filter by status
- `priority` (string, optional) - Filter by priority
- `search` (string, optional) - Search project names and descriptions
- `tags` (string, optional) - Filter by tags (comma-separated)
- `owner` (string, optional) - Filter by owner ID
- `sortBy` (string, optional) - Sort field (name, createdAt, updatedAt, priority)
- `sortOrder` (string, optional) - Sort order (asc, desc)
- `dateRange` (string, optional) - Date range filter (thisWeek, thisMonth, thisQuarter, custom)

**Response (200):**
```json
{
  "status": "success",
  "message": "Projects retrieved successfully",
  "data": {
    "projects": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "name": "Q4 Marketing Campaign",
        "description": "Q4 2025 marketing initiatives and campaigns",
        "owner": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
          "name": "John Doe",
          "avatar": "https://example.com/avatar.jpg"
        },
        "status": "planning",
        "priority": "high",
        "progress": 25,
        "startDate": "2025-10-01T00:00:00.000Z",
        "endDate": "2025-12-31T23:59:59.000Z",
        "budget": 50000,
        "currency": "USD",
        "tags": ["marketing", "Q4", "campaign"],
        "stats": {
          "taskCount": 15,
          "completedTasks": 4,
          "memberCount": 5,
          "timeSpent": 7200
        },
        "nextMilestone": "Campaign Launch",
        "overdueTasks": 2,
        "isOverdue": false,
        "createdAt": "2025-10-22T10:30:00.000Z",
        "updatedAt": "2025-10-22T14:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "availableStatuses": ["planning", "inProgress", "onHold", "completed", "cancelled"],
      "availablePriorities": ["low", "medium", "high", "urgent"],
      "availableTags": ["marketing", "development", "design", "Q4"]
    }
  }
}
```

### 3. Get Project by ID

Retrieve detailed information about a specific project.

```http
GET /api/project/{projectId}/workspace/{workspaceId}
```

**Authentication:** Required (Session or JWT)

**Path Parameters:**
- `projectId` (string) - Project ID
- `workspaceId` (string) - Workspace ID

**Response (200):**
```json
{
  "status": "success",
  "message": "Project retrieved successfully",
  "data": {
    "project": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Q4 Marketing Campaign",
      "description": "Q4 2025 marketing initiatives and campaigns",
      "workspace": "64f1a2b3c4d5e6f7g8h9i0j3",
      "owner": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://example.com/avatar.jpg"
      },
      "status": "inProgress",
      "priority": "high",
      "progress": 45,
      "startDate": "2025-10-01T00:00:00.000Z",
      "endDate": "2025-12-31T23:59:59.000Z",
      "budget": {
        "allocated": 50000,
        "spent": 12500,
        "remaining": 37500,
        "currency": "USD"
      },
      "timeline": {
        "plannedStart": "2025-10-01T00:00:00.000Z",
        "actualStart": "2025-10-05T00:00:00.000Z",
        "plannedEnd": "2025-12-31T23:59:59.000Z",
        "estimatedEnd": "2025-12-28T23:59:59.000Z"
      },
      "tags": ["marketing", "Q4", "campaign"],
      "customFields": [
        {
          "name": "Campaign Type",
          "type": "select",
          "value": "Digital"
        }
      ],
      "settings": {
        "isPublic": false,
        "allowGuestAccess": true,
        "defaultView": "kanban",
        "timeTrackingEnabled": true,
        "taskAutoAssignment": false
      },
      "members": [
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
          "name": "John Doe",
          "role": "owner",
          "joinedAt": "2025-10-01T00:00:00.000Z",
          "tasksAssigned": 8,
          "tasksCompleted": 3
        }
      ],
      "stats": {
        "taskCount": 25,
        "completedTasks": 11,
        "overdueTasks": 3,
        "memberCount": 6,
        "timeSpent": 15600,
        "estimatedTimeRemaining": 24000
      },
      "milestones": [
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j5",
          "name": "Campaign Launch",
          "description": "Launch main marketing campaign",
          "dueDate": "2025-11-15T00:00:00.000Z",
          "status": "upcoming",
          "completed": false
        }
      ],
      "recentActivity": [
        {
          "type": "task_completed",
          "user": "Jane Smith",
          "description": "Completed task 'Design campaign assets'",
          "timestamp": "2025-10-22T09:30:00.000Z"
        }
      ],
      "createdAt": "2025-10-22T10:30:00.000Z",
      "updatedAt": "2025-10-22T14:00:00.000Z"
    }
  }
}
```

### 4. Update Project

Update project details and settings.

```http
PUT /api/project/{projectId}/workspace/{workspaceId}/update
```

**Authentication:** Required (Session or JWT)
**Permissions:** Project owner or workspace admin

**Path Parameters:**
- `projectId` (string) - Project ID
- `workspaceId` (string) - Workspace ID

**Request Body:**
```json
{
  "name": "Updated Q4 Marketing Campaign",
  "description": "Updated description for Q4 marketing initiatives",
  "status": "inProgress",
  "priority": "high",
  "startDate": "2025-10-01T00:00:00.000Z",
  "endDate": "2025-12-31T23:59:59.000Z",
  "budget": 60000,
  "currency": "USD",
  "tags": ["marketing", "Q4", "campaign", "updated"],
  "settings": {
    "isPublic": true,
    "allowGuestAccess": true,
    "defaultView": "timeline"
  },
  "customFields": [
    {
      "name": "Campaign Type",
      "value": "Digital"
    }
  ]
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Project updated successfully",
  "data": {
    "project": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Updated Q4 Marketing Campaign",
      "description": "Updated description for Q4 marketing initiatives",
      "status": "inProgress",
      "priority": "high",
      "budget": 60000,
      "tags": ["marketing", "Q4", "campaign", "updated"],
      "settings": {
        "isPublic": true,
        "allowGuestAccess": true,
        "defaultView": "timeline"
      },
      "updatedAt": "2025-10-22T15:00:00.000Z"
    }
  }
}
```

### 5. Delete Project

Delete a project and all its associated data.

```http
DELETE /api/project/{projectId}/workspace/{workspaceId}/delete
```

**Authentication:** Required (Session or JWT)
**Permissions:** Project owner or workspace admin

**Path Parameters:**
- `projectId` (string) - Project ID
- `workspaceId` (string) - Workspace ID

**Query Parameters:**
- `confirm` (boolean, optional) - Confirmation flag (default: false)
- `transferTasksTo` (string, optional) - Project ID to transfer tasks to

**Response (200):**
```json
{
  "status": "success",
  "message": "Project deleted successfully",
  "data": {
    "deletedProject": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Q4 Marketing Campaign"
    },
    "affectedItems": {
      "tasksDeleted": 25,
      "filesDeleted": 156,
      "commentsDeleted": 89
    }
  }
}
```

### 6. Get Project Analytics

Retrieve comprehensive analytics and metrics for a project.

```http
GET /api/project/{projectId}/workspace/{workspaceId}/analytics
```

**Authentication:** Required (Session or JWT)
**Permissions:** Project member

**Path Parameters:**
- `projectId` (string) - Project ID
- `workspaceId` (string) - Workspace ID

**Query Parameters:**
- `period` (string, optional) - Time period (7d, 30d, 90d, custom)
- `startDate` (string, optional) - Custom start date
- `endDate` (string, optional) - Custom end date
- `metrics` (string, optional) - Specific metrics to include

**Response (200):**
```json
{
  "status": "success",
  "message": "Project analytics retrieved successfully",
  "data": {
    "overview": {
      "totalTasks": 25,
      "completedTasks": 11,
      "inProgressTasks": 10,
      "overdueTasks": 4,
      "completionRate": 44,
      "averageTaskDuration": 3.2,
      "totalTimeSpent": 15600,
      "estimatedTimeRemaining": 24000
    },
    "progress": {
      "currentProgress": 45,
      "expectedProgress": 50,
      "progressStatus": "slightly_behind",
      "daysElapsed": 22,
      "totalDays": 91,
      "daysRemaining": 69
    },
    "budget": {
      "allocated": 50000,
      "spent": 12500,
      "remaining": 37500,
      "burnRate": 1562.50,
      "estimatedCompletionCost": 45000,
      "budgetStatus": "on_track"
    },
    "team": {
      "memberCount": 6,
      "activeMembers": 5,
      "averageTasksPerMember": 4.2,
      "topContributor": {
        "userId": "64f1a2b3c4d5e6f7g8h9i0j6",
        "name": "Jane Smith",
        "tasksCompleted": 5,
        "timeSpent": 4800
      },
      "workloadDistribution": {
        "balanced": true,
        "overloadedMembers": [],
        "underloadedMembers": []
      }
    },
    "timeline": {
      "plannedDuration": 91,
      "estimatedDuration": 87,
      "projectedEndDate": "2025-12-28T23:59:59.000Z",
      "milestonesProgress": [
        {
          "milestone": "Campaign Launch",
          "plannedDate": "2025-11-15T00:00:00.000Z",
          "estimatedDate": "2025-11-18T00:00:00.000Z",
          "status": "at_risk",
          "progress": 60
        }
      ]
    },
    "tasks": {
      "byStatus": {
        "todo": 4,
        "inProgress": 10,
        "review": 3,
        "completed": 8
      },
      "byPriority": {
        "low": 5,
        "medium": 12,
        "high": 6,
        "urgent": 2
      },
      "completionTrend": [
        {
          "date": "2025-10-20",
          "completed": 2,
          "created": 3
        },
        {
          "date": "2025-10-21",
          "completed": 4,
          "created": 2
        }
      ]
    },
    "riskFactors": [
      {
        "type": "budget_overrun",
        "severity": "medium",
        "description": "Current spending rate exceeds budget allocation",
        "recommendation": "Review expenses and adjust budget if needed"
      },
      {
        "type": "timeline_delay",
        "severity": "low",
        "description": "Some milestones may be delayed",
        "recommendation": "Reallocate resources to critical path tasks"
      }
    ]
  }
}
```

### 7. Get Project Members

Retrieve all members of a project with their roles and contributions.

```http
GET /api/project/{projectId}/workspace/{workspaceId}/members
```

**Authentication:** Required (Session or JWT)
**Permissions:** Project member

**Path Parameters:**
- `projectId` (string) - Project ID
- `workspaceId` (string) - Workspace ID

**Query Parameters:**
- `role` (string, optional) - Filter by role
- `includeStats` (boolean, optional) - Include member statistics

**Response (200):**
```json
{
  "status": "success",
  "message": "Project members retrieved successfully",
  "data": {
    "members": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://example.com/avatar.jpg",
        "role": "owner",
        "joinedAt": "2025-10-01T00:00:00.000Z",
        "lastActive": "2025-10-22T14:30:00.000Z",
        "stats": {
          "tasksAssigned": 8,
          "tasksCompleted": 3,
          "tasksInProgress": 3,
          "overdueTasks": 2,
          "timeSpent": 3600,
          "averageTaskCompletionTime": 2.5,
          "contributionScore": 75
        },
        "permissions": {
          "canEditProject": true,
          "canDeleteProject": true,
          "canManageMembers": true,
          "canViewAnalytics": true
        }
      },
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j6",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "avatar": "https://example.com/avatar2.jpg",
        "role": "member",
        "joinedAt": "2025-10-05T00:00:00.000Z",
        "lastActive": "2025-10-22T16:00:00.000Z",
        "stats": {
          "tasksAssigned": 6,
          "tasksCompleted": 5,
          "tasksInProgress": 1,
          "overdueTasks": 0,
          "timeSpent": 4800,
          "averageTaskCompletionTime": 1.8,
          "contributionScore": 92
        },
        "permissions": {
          "canEditProject": false,
          "canDeleteProject": false,
          "canManageMembers": false,
          "canViewAnalytics": true
        }
      }
    ],
    "summary": {
      "totalMembers": 6,
      "activeMembers": 5,
      "roles": {
        "owner": 1,
        "admin": 1,
        "member": 4
      },
      "averageContribution": 78.5
    }
  }
}
```

### 8. Duplicate Project

Create a copy of an existing project with all its settings and structure.

```http
POST /api/project/{projectId}/workspace/{workspaceId}/duplicate
```

**Authentication:** Required (Session or JWT)
**Permissions:** Project member

**Path Parameters:**
- `projectId` (string) - Project ID to duplicate
- `workspaceId` (string) - Target workspace ID

**Request Body:**
```json
{
  "name": "Q4 Marketing Campaign - Copy",
  "description": "Copy of Q4 Marketing Campaign",
  "includeTasks": true,
  "includeMembers": false,
  "includeFiles": true,
  "includeCustomFields": true,
  "adjustDates": {
    "enabled": true,
    "startDate": "2025-11-01T00:00:00.000Z",
    "shiftDays": 31
  },
  "status": "planning"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Project duplicated successfully",
  "data": {
    "originalProject": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Q4 Marketing Campaign"
    },
    "newProject": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j7",
      "name": "Q4 Marketing Campaign - Copy",
      "description": "Copy of Q4 Marketing Campaign",
      "status": "planning",
      "startDate": "2025-11-01T00:00:00.000Z",
      "endDate": "2026-01-31T23:59:59.000Z",
      "createdAt": "2025-10-22T16:00:00.000Z"
    },
    "duplicatedItems": {
      "tasksCopied": 25,
      "filesCopied": 156,
      "customFieldsCopied": 3,
      "membersCopied": 0
    }
  }
}
```

## 📊 Data Models

### Project Object
```json
{
  "_id": "string",
  "name": "string",
  "description": "string",
  "workspace": "string",
  "owner": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "avatar": "string"
  },
  "status": "planning|inProgress|onHold|completed|cancelled",
  "priority": "low|medium|high|urgent",
  "progress": "number",
  "startDate": "string",
  "endDate": "string",
  "budget": {
    "allocated": "number",
    "spent": "number",
    "remaining": "number",
    "currency": "string"
  },
  "tags": ["string"],
  "customFields": [
    {
      "name": "string",
      "type": "text|number|date|select|checkbox",
      "value": "any",
      "required": "boolean"
    }
  ],
  "settings": {
    "isPublic": "boolean",
    "allowGuestAccess": "boolean",
    "defaultView": "string",
    "timeTrackingEnabled": "boolean"
  },
  "stats": {
    "taskCount": "number",
    "completedTasks": "number",
    "memberCount": "number",
    "timeSpent": "number"
  },
  "createdAt": "string",
  "updatedAt": "string"
}
```

### Project Analytics Object
```json
{
  "overview": {
    "totalTasks": "number",
    "completedTasks": "number",
    "completionRate": "number",
    "totalTimeSpent": "number"
  },
  "progress": {
    "currentProgress": "number",
    "expectedProgress": "number",
    "daysRemaining": "number"
  },
  "budget": {
    "allocated": "number",
    "spent": "number",
    "remaining": "number",
    "burnRate": "number"
  },
  "team": {
    "memberCount": "number",
    "activeMembers": "number",
    "topContributor": "object"
  },
  "riskFactors": [
    {
      "type": "string",
      "severity": "low|medium|high",
      "description": "string",
      "recommendation": "string"
    }
  ]
}
```

## 🔒 Permissions

### Project-Based Access Control

| Action | Owner | Admin | Member | Guest |
|--------|-------|-------|--------|-------|
| View project | ✅ | ✅ | ✅ | ✅* |
| Edit project | ✅ | ✅ | ❌ | ❌ |
| Delete project | ✅ | ❌ | ❌ | ❌ |
| Manage members | ✅ | ✅ | ❌ | ❌ |
| View analytics | ✅ | ✅ | ✅ | ❌ |
| Duplicate project | ✅ | ✅ | ✅ | ❌ |

*Guest access only if project allows guests

### Workspace-Level Permissions

Project creation and management may be limited by subscription plans and workspace settings.

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

**Project Limit Exceeded (403):**
```json
{
  "status": "error",
  "message": "Project limit reached. Upgrade your plan to create more projects.",
  "error": "PROJECT_LIMIT_EXCEEDED",
  "current": 3,
  "limit": 3,
  "suggestion": "Upgrade to Professional plan for unlimited projects"
}
```

**Validation Error (422):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "error": "VALIDATION_ERROR",
  "details": {
    "name": "Project name is required",
    "endDate": "End date must be after start date"
  }
}
```

## 🔄 Real-time Updates

Project changes are broadcasted to project members:

```javascript
// WebSocket events for project updates
socket.on('project:updated', (data) => {
  // Handle project update
});

socket.on('project:member:added', (data) => {
  // Handle new member
});

socket.on('project:task:completed', (data) => {
  // Handle task completion
});

socket.on('project:progress:updated', (data) => {
  // Handle progress update
});
```

---

**Related Documentation:**
- [Task Management API](./TASK_API.md)
- [Workspace API](./WORKSPACE_API.md)
- [Analytics API](./ANALYTICS_API.md)
- [Main API Documentation](./API_DOCUMENTATION.md)