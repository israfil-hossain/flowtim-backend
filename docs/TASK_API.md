# Task Management API

Complete task management endpoints for the Flowtim platform.

## 📋 Overview

The task API provides comprehensive task management capabilities including creation, assignment, tracking, collaboration, and time tracking. Tasks can be organized within projects and support various statuses, priorities, and custom workflows.

## 🔐 Base URL

```
http://localhost:8000/api/task
```

## 📝 Endpoints

### 1. Create New Task

Create a new task within a project.

```http
POST /api/task/project/{projectId}/workspace/{workspaceId}/create
```

**Authentication:** Required (Session or JWT)

**Path Parameters:**
- `projectId` (string) - Project ID
- `workspaceId` (string) - Workspace ID

**Request Body:**
```json
{
  "title": "Design new landing page",
  "description": "Create a modern, responsive landing page for the new product launch",
  "status": "todo",
  "priority": "high",
  "assignedTo": ["64f1a2b3c4d5e6f7g8h9i0j4", "64f1a2b3c4d5e6f7g8h9i0j5"],
  "reportedBy": "64f1a2b3c4d5e6f7g8h9i0j6",
  "labels": ["design", "ui/ux", "landing-page"],
  "dueDate": "2025-11-15T17:00:00.000Z",
  "startDate": "2025-10-25T09:00:00.000Z",
  "estimatedHours": 16,
  "storyPoints": 5,
  "parentTask": null,
  "dependencies": ["64f1a2b3c4d5e6f7g8h9i0j7"],
  "tags": ["design", "marketing", "Q4"],
  "customFields": [
    {
      "name": "Design Tool",
      "type": "select",
      "value": "Figma"
    },
    {
      "name": "Page Sections",
      "type": "number",
      "value": 8
    }
  ],
  "attachments": [
    {
      "name": "brand-guidelines.pdf",
      "url": "https://example.com/files/brand-guidelines.pdf",
      "size": 2048576
    }
  ],
  "checklist": [
    {
      "text": "Research competitor landing pages",
      "completed": true
    },
    {
      "text": "Create wireframes",
      "completed": false
    },
    {
      "text": "Design high-fidelity mockups",
      "completed": false
    }
  ],
  "watchers": ["64f1a2b3c4d5e6f7g8h9i0j8"],
  "settings": {
    "timeTrackingEnabled": true,
    "allowComments": true,
    "requireApproval": false
  }
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Task created successfully",
  "data": {
    "task": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j9",
      "title": "Design new landing page",
      "description": "Create a modern, responsive landing page for the new product launch",
      "project": "64f1a2b3c4d5e6f7g8h9i0j1",
      "workspace": "64f1a2b3c4d5e6f7g8h9i0j2",
      "status": "todo",
      "priority": "high",
      "assignedTo": [
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
          "name": "Alice Johnson",
          "email": "alice@example.com",
          "avatar": "https://example.com/avatar1.jpg"
        },
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j5",
          "name": "Bob Smith",
          "email": "bob@example.com",
          "avatar": "https://example.com/avatar2.jpg"
        }
      ],
      "reportedBy": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j6",
        "name": "Carol Davis",
        "email": "carol@example.com",
        "avatar": "https://example.com/avatar3.jpg"
      },
      "labels": ["design", "ui/ux", "landing-page"],
      "dueDate": "2025-11-15T17:00:00.000Z",
      "startDate": "2025-10-25T09:00:00.000Z",
      "estimatedHours": 16,
      "storyPoints": 5,
      "progress": 0,
      "timeSpent": 0,
      "tags": ["design", "marketing", "Q4"],
      "customFields": [
        {
          "name": "Design Tool",
          "type": "select",
          "value": "Figma"
        },
        {
          "name": "Page Sections",
          "type": "number",
          "value": 8
        }
      ],
      "checklist": [
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0ja",
          "text": "Research competitor landing pages",
          "completed": true,
          "completedBy": "64f1a2b3c4d5e6f7g8h9i0j4",
          "completedAt": "2025-10-22T10:30:00.000Z"
        },
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0jb",
          "text": "Create wireframes",
          "completed": false
        },
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0jc",
          "text": "Design high-fidelity mockups",
          "completed": false
        }
      ],
      "attachments": [
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0jd",
          "name": "brand-guidelines.pdf",
          "url": "https://example.com/files/brand-guidelines.pdf",
          "size": 2048576,
          "uploadedBy": "64f1a2b3c4d5e6f7g8h9i0j6",
          "uploadedAt": "2025-10-22T10:00:00.000Z"
        }
      ],
      "watchers": [
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j8",
          "name": "David Wilson",
          "email": "david@example.com"
        }
      ],
      "dependencies": [
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j7",
          "title": "Complete brand guidelines",
          "status": "completed"
        }
      ],
      "subtasks": [],
      "comments": [],
      "settings": {
        "timeTrackingEnabled": true,
        "allowComments": true,
        "requireApproval": false
      },
      "activity": [
        {
          "action": "created",
          "user": "64f1a2b3c4d5e6f7g8h9i0j6",
          "timestamp": "2025-10-22T10:00:00.000Z",
          "details": "Task created"
        }
      ],
      "createdAt": "2025-10-22T10:00:00.000Z",
      "updatedAt": "2025-10-22T10:00:00.000Z"
    }
  }
}
```

### 2. Get Workspace Tasks

Retrieve all tasks within a workspace with advanced filtering and search.

```http
GET /api/task/workspace/{workspaceId}/all
```

**Authentication:** Required (Session or JWT)

**Path Parameters:**
- `workspaceId` (string) - Workspace ID

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20)
- `projectId` (string, optional) - Filter by project ID
- `status` (string, optional) - Filter by status (todo, inProgress, review, done)
- `priority` (string, optional) - Filter by priority (low, medium, high, urgent)
- `assignedTo` (string, optional) - Filter by assignee ID
- `reportedBy` (string, optional) - Filter by reporter ID
- `labels` (string, optional) - Filter by labels (comma-separated)
- `tags` (string, optional) - Filter by tags (comma-separated)
- `dueDate` (string, optional) - Filter by due date (overdue, today, thisWeek, thisMonth)
- `createdDate` (string, optional) - Filter by creation date (today, thisWeek, thisMonth)
- `search` (string, optional) - Search in title, description
- `sortBy` (string, optional) - Sort field (createdAt, updatedAt, dueDate, priority, title)
- `sortOrder` (string, optional) - Sort order (asc, desc)
- `includeSubtasks` (boolean, optional) - Include subtasks in results
- `includeCompleted` (boolean, optional) - Include completed tasks

**Response (200):**
```json
{
  "status": "success",
  "message": "Tasks retrieved successfully",
  "data": {
    "tasks": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j9",
        "title": "Design new landing page",
        "description": "Create a modern, responsive landing page for the new product launch",
        "project": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
          "name": "Q4 Marketing Campaign"
        },
        "status": "inProgress",
        "priority": "high",
        "assignedTo": [
          {
            "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
            "name": "Alice Johnson",
            "avatar": "https://example.com/avatar1.jpg"
          }
        ],
        "dueDate": "2025-11-15T17:00:00.000Z",
        "estimatedHours": 16,
        "timeSpent": 4.5,
        "progress": 30,
        "labels": ["design", "ui/ux"],
        "tags": ["design", "marketing"],
        "checklistProgress": {
          "total": 3,
          "completed": 1,
          "percentage": 33
        },
        "subtaskCount": 2,
        "commentCount": 5,
        "attachmentCount": 1,
        "isOverdue": false,
        "daysUntilDue": 24,
        "createdAt": "2025-10-22T10:00:00.000Z",
        "updatedAt": "2025-10-22T14:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "availableStatuses": ["todo", "inProgress", "review", "done", "cancelled"],
      "availablePriorities": ["low", "medium", "high", "urgent"],
      "availableLabels": ["design", "development", "marketing", "urgent"],
      "availableAssignees": [
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
          "name": "Alice Johnson",
          "taskCount": 12
        }
      ]
    },
    "summary": {
      "totalTasks": 156,
      "completedTasks": 89,
      "inProgressTasks": 45,
      "overdueTasks": 8,
      "dueThisWeek": 23,
      "createdThisWeek": 18
    }
  }
}
```

### 3. Get Task by ID

Retrieve detailed information about a specific task.

```http
GET /api/task/{taskId}/workspace/{workspaceId}
```

**Authentication:** Required (Session or JWT)

**Path Parameters:**
- `taskId` (string) - Task ID
- `workspaceId` (string) - Workspace ID

**Query Parameters:**
- `includeComments` (boolean, optional) - Include task comments
- `includeTimeLogs` (boolean, optional) - Include time tracking logs
- `includeActivity` (boolean, optional) - Include activity history

**Response (200):**
```json
{
  "status": "success",
  "message": "Task retrieved successfully",
  "data": {
    "task": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j9",
      "title": "Design new landing page",
      "description": "Create a modern, responsive landing page for the new product launch",
      "project": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "name": "Q4 Marketing Campaign",
        "status": "inProgress"
      },
      "workspace": "64f1a2b3c4d5e6f7g8h9i0j2",
      "status": "inProgress",
      "priority": "high",
      "assignedTo": [
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
          "name": "Alice Johnson",
          "email": "alice@example.com",
          "avatar": "https://example.com/avatar1.jpg"
        }
      ],
      "reportedBy": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j6",
        "name": "Carol Davis",
        "email": "carol@example.com",
        "avatar": "https://example.com/avatar3.jpg"
      },
      "labels": ["design", "ui/ux", "landing-page"],
      "dueDate": "2025-11-15T17:00:00.000Z",
      "startDate": "2025-10-25T09:00:00.000Z",
      "estimatedHours": 16,
      "storyPoints": 5,
      "progress": 45,
      "timeSpent": 7.25,
      "tags": ["design", "marketing", "Q4"],
      "customFields": [
        {
          "name": "Design Tool",
          "type": "select",
          "value": "Figma"
        }
      ],
      "checklist": [
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0ja",
          "text": "Research competitor landing pages",
          "completed": true,
          "completedBy": "64f1a2b3c4d5e6f7g8h9i0j4",
          "completedAt": "2025-10-22T11:00:00.000Z"
        },
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0jb",
          "text": "Create wireframes",
          "completed": false
        }
      ],
      "attachments": [
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0jd",
          "name": "brand-guidelines.pdf",
          "url": "https://example.com/files/brand-guidelines.pdf",
          "size": 2048576,
          "type": "application/pdf"
        }
      ],
      "dependencies": {
        "blocking": [
          {
            "_id": "64f1a2b3c4d5e6f7g8h9i0j7",
            "title": "Complete brand guidelines",
            "status": "completed"
          }
        ],
        "blockedBy": [
          {
            "_id": "64f1a2b3c4d5e6f7g8h9i0jk",
            "title": "Get client approval",
            "status": "todo"
          }
        ]
      },
      "subtasks": [
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0jl",
          "title": "Mobile version design",
          "status": "todo",
          "assignedTo": "64f1a2b3c4d5e6f7g8h9i0j5",
          "progress": 0
        }
      ],
      "timeTracking": {
        "enabled": true,
        "totalTimeSpent": 7.25,
        "todayTimeSpent": 2.5,
        "entries": [
          {
            "_id": "64f1a2b3c4d5e6f7g8h9i0jm",
            "user": "64f1a2b3c4d5e6f7g8h9i0j4",
            "duration": 2.5,
            "description": "Working on wireframes",
            "date": "2025-10-22T09:00:00.000Z"
          }
        ]
      },
      "watchers": [
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j8",
          "name": "David Wilson",
          "email": "david@example.com"
        }
      ],
      "comments": [
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0jn",
          "text": "Great progress on the wireframes!",
          "author": "64f1a2b3c4d5e6f7g8h9i0j6",
          "createdAt": "2025-10-22T14:00:00.000Z",
          "reactions": [
            {
              "emoji": "👍",
              "users": ["64f1a2b3c4d5e6f7g8h9i0j4", "64f1a2b3c4d5e6f7g8h9i0j5"]
            }
          ]
        }
      ],
      "activity": [
        {
          "action": "status_changed",
          "user": "64f1a2b3c4d5e6f7g8h9i0j4",
          "timestamp": "2025-10-22T13:30:00.000Z",
          "details": {
            "from": "todo",
            "to": "inProgress"
          }
        }
      ],
      "settings": {
        "timeTrackingEnabled": true,
        "allowComments": true,
        "requireApproval": false
      },
      "createdAt": "2025-10-22T10:00:00.000Z",
      "updatedAt": "2025-10-22T14:30:00.000Z"
    }
  }
}
```

### 4. Update Task

Update task details, status, assignment, and other properties.

```http
PUT /api/task/{taskId}/project/{projectId}/workspace/{workspaceId}/update
```

**Authentication:** Required (Session or JWT)
**Permissions:** Task assignee, project admin, or workspace admin

**Path Parameters:**
- `taskId` (string) - Task ID
- `projectId` (string) - Project ID
- `workspaceId` (string) - Workspace ID

**Request Body:**
```json
{
  "title": "Design new landing page - Updated",
  "description": "Create a modern, responsive landing page with improved UX",
  "status": "inProgress",
  "priority": "high",
  "assignedTo": ["64f1a2b3c4d5e6f7g8h9i0j4"],
  "labels": ["design", "ui/ux", "landing-page", "high-priority"],
  "dueDate": "2025-11-20T17:00:00.000Z",
  "estimatedHours": 20,
  "storyPoints": 8,
  "progress": 60,
  "customFields": [
    {
      "name": "Design Tool",
      "value": "Figma"
    },
    {
      "name": "Page Sections",
      "value": 10
    }
  ],
  "checklist": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0jb",
      "completed": true
    },
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0jc",
      "completed": false
    }
  ],
  "tags": ["design", "marketing", "Q4", "updated"],
  "comment": "Updated timeline and added more detailed requirements"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Task updated successfully",
  "data": {
    "task": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j9",
      "title": "Design new landing page - Updated",
      "description": "Create a modern, responsive landing page with improved UX",
      "status": "inProgress",
      "priority": "high",
      "progress": 60,
      "estimatedHours": 20,
      "storyPoints": 8,
      "dueDate": "2025-11-20T17:00:00.000Z",
      "updatedAt": "2025-10-22T15:00:00.000Z",
      "lastUpdatedBy": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
        "name": "Alice Johnson"
      }
    },
    "activity": {
      "action": "updated",
      "user": "64f1a2b3c4d5e6f7g8h9i0j4",
      "timestamp": "2025-10-22T15:00:00.000Z",
      "changes": {
        "progress": {
          "from": 45,
          "to": 60
        },
        "estimatedHours": {
          "from": 16,
          "to": 20
        }
      }
    }
  }
}
```

### 5. Delete Task

Delete a task and optionally move its subtasks to another task.

```http
DELETE /api/task/{taskId}/workspace/{workspaceId}/delete
```

**Authentication:** Required (Session or JWT)
**Permissions:** Task creator, project admin, or workspace admin

**Path Parameters:**
- `taskId` (string) - Task ID
- `workspaceId` (string) - Workspace ID

**Query Parameters:**
- `moveSubtasksTo` (string, optional) - Task ID to move subtasks to
- `confirm` (boolean, optional) - Confirmation flag

**Response (200):**
```json
{
  "status": "success",
  "message": "Task deleted successfully",
  "data": {
    "deletedTask": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j9",
      "title": "Design new landing page"
    },
    "affectedItems": {
      "subtasksMoved": 2,
      "subtasksDeleted": 0,
      "commentsDeleted": 5,
      "attachmentsDeleted": 1,
      "timeEntriesDeleted": 3
    }
  }
}
```

### 6. Add Task Comment

Add a comment to a task.

```http
POST /api/task/{taskId}/comments
```

**Authentication:** Required (Session or JWT)

**Path Parameters:**
- `taskId` (string) - Task ID

**Request Body:**
```json
{
  "text": "I've completed the wireframes and started working on the high-fidelity designs. The mobile version is proving challenging due to the responsive requirements.",
  "mentions": ["64f1a2b3c4d5e6f7g8h9i0j6"],
  "attachments": [
    {
      "name": "wireframe-v2.png",
      "url": "https://example.com/files/wireframe-v2.png"
    }
  ],
  "isInternal": false
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Comment added successfully",
  "data": {
    "comment": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0jp",
      "text": "I've completed the wireframes and started working on the high-fidelity designs...",
      "author": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
        "name": "Alice Johnson",
        "avatar": "https://example.com/avatar1.jpg"
      },
      "mentions": [
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j6",
          "name": "Carol Davis"
        }
      ],
      "attachments": [
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0jq",
          "name": "wireframe-v2.png",
          "url": "https://example.com/files/wireframe-v2.png",
          "size": 1024000
        }
      ],
      "isEdited": false,
      "reactions": [],
      "createdAt": "2025-10-22T15:30:00.000Z",
      "updatedAt": "2025-10-22T15:30:00.000Z"
    }
  }
}
```

### 7. Upload Task Attachment

Upload a file attachment to a task.

```http
POST /api/task/{taskId}/attachments
```

**Authentication:** Required (Session or JWT)

**Path Parameters:**
- `taskId` (string) - Task ID

**Request Body (multipart/form-data):**
```
file: [File data]
description: "Updated wireframes with mobile considerations"
isPublic: false
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Attachment uploaded successfully",
  "data": {
    "attachment": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0jr",
      "name": "wireframe-v2.png",
      "originalName": "wireframe-v2.png",
      "url": "https://example.com/files/tasks/64f1a2b3c4d5e6f7g8h9i0jr/wireframe-v2.png",
      "size": 1024000,
      "type": "image/png",
      "description": "Updated wireframes with mobile considerations",
      "isPublic": false,
      "uploadedBy": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
        "name": "Alice Johnson"
      },
      "uploadedAt": "2025-10-22T15:45:00.000Z"
    }
  }
}
```

### 8. Add Time Entry

Add a time tracking entry to a task.

```http
POST /api/task/{taskId}/time-log
```

**Authentication:** Required (Session or JWT)

**Path Parameters:**
- `taskId` (string) - Task ID

**Request Body:**
```json
{
  "duration": 2.5,
  "description": "Working on responsive design adjustments",
  "date": "2025-10-22T09:00:00.000Z",
  "billable": true,
  "tags": ["design", "responsive"]
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Time entry added successfully",
  "data": {
    "timeEntry": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0js",
      "user": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
        "name": "Alice Johnson"
      },
      "task": "64f1a2b3c4d5e6f7g8h9i0j9",
      "duration": 2.5,
      "description": "Working on responsive design adjustments",
      "date": "2025-10-22T09:00:00.000Z",
      "billable": true,
      "tags": ["design", "responsive"],
      "createdAt": "2025-10-22T15:50:00.000Z"
    },
    "updatedTaskStats": {
      "totalTimeSpent": 9.75,
      "todayTimeSpent": 5.0,
      "estimatedHoursRemaining": 6.25
    }
  }
}
```

### 9. Bulk Update Tasks

Update multiple tasks at once.

```http
PUT /api/task/workspace/{workspaceId}/bulk-update
```

**Authentication:** Required (Session or JWT)
**Permissions:** Project admin or workspace admin

**Path Parameters:**
- `workspaceId` (string) - Workspace ID

**Request Body:**
```json
{
  "taskIds": ["64f1a2b3c4d5e6f7g8h9i0j9", "64f1a2b3c4d5e6f7g8h9i0jl", "64f1a2b3c4d5e6f7g8h9i0jm"],
  "updates": {
    "status": "inProgress",
    "priority": "high",
    "assignedTo": ["64f1a2b3c4d5e6f7g8h9i0j4"],
    "labels": ["urgent", "Q4-2025"],
    "dueDate": "2025-11-15T17:00:00.000Z"
  },
  "comment": "Bulk update for Q4 campaign tasks - raising priority and status",
  "notifyAssignees": true
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Tasks updated successfully",
  "data": {
    "updatedTasks": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j9",
        "title": "Design new landing page",
        "status": "inProgress",
        "priority": "high",
        "updatedAt": "2025-10-22T16:00:00.000Z"
      }
    ],
    "summary": {
      "totalTasks": 3,
      "updatedTasks": 3,
      "failedTasks": 0,
      "changes": {
        "status": "todo → inProgress",
        "priority": "medium → high",
        "labels": ["design", "ui/ux"] → ["urgent", "Q4-2025"]
      }
    },
    "notificationsSent": 2
  }
}
```

## 📊 Data Models

### Task Object
```json
{
  "_id": "string",
  "title": "string",
  "description": "string",
  "project": "string",
  "workspace": "string",
  "status": "todo|inProgress|review|done|cancelled",
  "priority": "low|medium|high|urgent",
  "assignedTo": ["string"],
  "reportedBy": "string",
  "labels": ["string"],
  "dueDate": "string",
  "startDate": "string",
  "estimatedHours": "number",
  "storyPoints": "number",
  "progress": "number",
  "timeSpent": "number",
  "tags": ["string"],
  "customFields": [
    {
      "name": "string",
      "type": "string",
      "value": "any"
    }
  ],
  "checklist": [
    {
      "_id": "string",
      "text": "string",
      "completed": "boolean",
      "completedBy": "string",
      "completedAt": "string"
    }
  ],
  "attachments": ["object"],
  "dependencies": {
    "blocking": ["object"],
    "blockedBy": ["object"]
  },
  "subtasks": ["object"],
  "watchers": ["object"],
  "settings": {
    "timeTrackingEnabled": "boolean",
    "allowComments": "boolean",
    "requireApproval": "boolean"
  },
  "createdAt": "string",
  "updatedAt": "string"
}
```

### Time Entry Object
```json
{
  "_id": "string",
  "user": "string",
  "task": "string",
  "duration": "number",
  "description": "string",
  "date": "string",
  "billable": "boolean",
  "tags": ["string"],
  "createdAt": "string"
}
```

## 🔒 Permissions

### Task-Based Access Control

| Action | Assignee | Creator | Project Admin | Workspace Admin |
|--------|----------|---------|---------------|-----------------|
| View task | ✅ | ✅ | ✅ | ✅ |
| Edit task | ✅ | ✅ | ✅ | ✅ |
| Delete task | ❌ | ✅ | ✅ | ✅ |
| Add comments | ✅ | ✅ | ✅ | ✅ |
| Track time | ✅ | ✅ | ✅ | ✅ |
| Change status | ✅ | ✅ | ✅ | ✅ |
| Reassign | ❌ | ✅ | ✅ | ✅ |

## 🚨 Error Handling

### Common Error Responses

**Task Not Found (404):**
```json
{
  "status": "error",
  "message": "Task not found",
  "error": "TASK_NOT_FOUND",
  "taskId": "64f1a2b3c4d5e6f7g8h9i0j9"
}
```

**Permission Denied (403):**
```json
{
  "status": "error",
  "message": "You don't have permission to update this task",
  "error": "INSUFFICIENT_PERMISSIONS",
  "requiredRole": "assignee_or_admin",
  "userRole": "member"
}
```

**Dependency Conflict (409):**
```json
{
  "status": "error",
  "message": "Cannot complete task - dependent tasks are not completed",
  "error": "DEPENDENCY_CONFLICT",
  "blockingTasks": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0jk",
      "title": "Get client approval",
      "status": "todo"
    }
  ]
}
```

## 🔄 Real-time Updates

Task changes are broadcasted in real-time:

```javascript
// WebSocket events for task updates
socket.on('task:created', (data) => {
  // Handle new task
});

socket.on('task:updated', (data) => {
  // Handle task update
});

socket.on('task:status_changed', (data) => {
  // Handle status change
});

socket.on('task:assigned', (data) => {
  // Handle task assignment
});

socket.on('task:comment_added', (data) => {
  // Handle new comment
});
```

---

**Related Documentation:**
- [Project Management API](./PROJECT_API.md)
- [Subtask API](./SUBTASK_API.md)
- [File Management API](./FILE_API.md)
- [Main API Documentation](./API_DOCUMENTATION.md)