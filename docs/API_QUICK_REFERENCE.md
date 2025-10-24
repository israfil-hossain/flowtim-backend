# 🚀 Flowtim API Quick Reference Guide

## 📋 **Quick Start**

### **Server Setup**
```bash
npm install
npm run dev
# Server runs on http://localhost:3000
# Swagger docs: http://localhost:3000/api-docs
```

### **Base URL**
```
Development: http://localhost:3000/api
Production: https://api.flowtim.com/api
```

---

## 🔗 **API Endpoints by Category**

### **🔐 Authentication**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | User login |
| `POST` | `/auth/register` | User registration |
| `GET` | `/auth/google` | Google OAuth |
| `POST` | `/auth/logout` | User logout |

### **👤 User Management**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/user/current` | Get current user |
| `PUT` | `/user/profile` | Update profile |
| `GET` | `/user/preferences` | Get preferences |

### **🏢 Workspaces**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/workspace/create/new` | Create workspace |
| `GET` | `/workspace/all` | Get all workspaces |
| `GET` | `/workspace/{id}` | Get workspace by ID |
| `PUT` | `/workspace/update/{id}` | Update workspace |

### **📂 Projects**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/project/workspace/{workspaceId}/create` | Create project |
| `GET` | `/project/workspace/{workspaceId}/all` | Get all projects |
| `GET` | `/project/{projectId}/workspace/{workspaceId}` | Get project |
| `PUT` | `/project/{projectId}/workspace/{workspaceId}/update` | Update project |

### **✅ Tasks**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/task/project/{projectId}/workspace/{workspaceId}/create` | Create task |
| `GET` | `/task/workspace/{workspaceId}/all` | Get all tasks |
| `GET` | `/task/{taskId}/workspace/{workspaceId}` | Get task |
| `PUT` | `/task/{taskId}/project/{projectId}/workspace/{workspaceId}/update` | Update task |

### **🔄 Subtasks**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/subtasks/workspaces/{workspaceId}/tasks/{taskId}/subtasks` | Get subtasks |
| `POST` | `/subtasks/workspaces/{workspaceId}/tasks/{taskId}/subtasks` | Create subtask |
| `PUT` | `/subtasks/workspaces/{workspaceId}/subtasks/{subtaskId}` | Update subtask |
| `GET` | `/subtasks/workspaces/{workspaceId}/tasks/{taskId}/progress` | Get progress |

### **📊 Kanban Board** 🆕
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/kanban/workspaces/{workspaceId}/tasks/kanban` | Get kanban board |
| `PUT` | `/kanban/workspaces/{workspaceId}/tasks/{taskId}/move` | Move task |
| `POST` | `/kanban/workspaces/{workspaceId}/kanban/columns` | Create column |
| `GET` | `/kanban/workspaces/{workspaceId}/kanban/columns` | Get columns |

### **📈 Gantt Chart** 🆕
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/gantt/workspaces/{workspaceId}/tasks/gantt` | Get Gantt data |
| `PUT` | `/gantt/workspaces/{workspaceId}/tasks/{taskId}/timeline` | Update timeline |
| `POST` | `/gantt/workspaces/{workspaceId}/tasks/{taskId}/dependencies` | Add dependency |
| `GET` | `/gantt/workspaces/{workspaceId}/projects/{projectId}/timeline` | Project timeline |

### **💬 Chat & Messaging**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/chat/workspaces/{workspaceId}/channels` | Get channels |
| `POST` | `/chat/workspaces/{workspaceId}/channels` | Create channel |
| `GET` | `/chat/workspaces/{workspaceId}/channels/{channelId}/messages` | Get messages |
| `POST` | `/chat/workspaces/{workspaceId}/channels/{channelId}/messages` | Send message |
| `POST` | `/chat/workspaces/{workspaceId}/messages/{messageId}/reactions` | Add reaction |

### **📄 Documents**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/document/workspace/{workspaceId}/documents` | Create document |
| `GET` | `/document/workspace/{workspaceId}/documents` | Get documents |
| `GET` | `/document/workspace/{workspaceId}/documents/{documentId}` | Get document |
| `PUT` | `/document/workspace/{workspaceId}/documents/{documentId}` | Update document |
| `POST` | `/document/workspace/{workspaceId}/documents/{documentId}/share` | Share document |

### **📁 File Management**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/files/workspaces/{workspaceId}/files/upload` | Upload file |
| `GET` | `/files/workspaces/{workspaceId}/files` | Get files |
| `GET` | `/files/files/{fileId}/download` | Download file |
| `POST` | `/files/workspaces/{workspaceId}/folders` | Create folder |
| `DELETE` | `/files/workspaces/{workspaceId}/files/{fileId}` | Delete file |

### **🔔 Notifications**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/notifications/users/{userId}/notifications` | Get notifications |
| `PUT` | `/notifications/users/{userId}/notifications/{notificationId}/read` | Mark as read |
| `PUT` | `/notifications/users/{userId}/notifications/mark-all-read` | Mark all read |
| `GET` | `/notifications/users/{userId}/notification-preferences` | Get preferences |

### **📊 Analytics**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/analytics/dashboard/{workspaceId}` | Dashboard analytics |
| `GET` | `/analytics/productivity/{workspaceId}` | Productivity metrics |
| `GET` | `/analytics/team-performance/{workspaceId}` | Team performance |
| `GET` | `/analytics/project-insights/{projectId}` | Project insights |

### **📋 Templates**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/templates/templates` | Get public templates |
| `GET` | `/templates/workspaces/{workspaceId}/templates` | Get workspace templates |
| `POST` | `/templates/workspaces/{workspaceId}/templates` | Create template |
| `POST` | `/templates/workspaces/{workspaceId}/projects/from-template/{templateId}` | Create from template |

### **🤖 Automation** 🆕
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/automations/workspaces/{workspaceId}/automations` | Get automation rules |
| `POST` | `/automations/workspaces/{workspaceId}/automations` | Create automation |
| `POST` | `/automations/workspaces/{workspaceId}/automations/{ruleId}/test` | Test automation |
| `GET` | `/automations/workspaces/{workspaceId}/automations/{ruleId}/logs` | Get logs |

---

## 🔧 **Common Request Examples**

### **Authentication**
```javascript
// Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Google OAuth
GET /api/auth/google
// Redirects to Google OAuth flow
```

### **Create Workspace**
```javascript
POST /api/workspace/create/new
{
  "name": "My Workspace",
  "description": "Project workspace for team collaboration"
}
```

### **Create Project**
```javascript
POST /api/project/workspace/123/create
{
  "name": "Website Redesign",
  "description": "Complete redesign of company website",
  "status": "ACTIVE",
  "priority": "HIGH"
}
```

### **Create Task**
```javascript
POST /api/task/project/456/workspace/123/create
{
  "title": "Design homepage",
  "description": "Create mockups for new homepage design",
  "priority": "HIGH",
  "assignedTo": "user_id",
  "dueDate": "2025-10-15T00:00:00.000Z"
}
```

### **Upload File**
```javascript
POST /api/files/workspaces/123/files/upload
Content-Type: multipart/form-data

form-data:
  file: [file_binary]
  projectId: "456"
  folderId: "folder_id" (optional)
```

### **Send Chat Message**
```javascript
POST /api/chat/workspaces/123/channels/789/messages
{
  "content": "Hello team! 👋",
  "mentions": ["user_id_1", "user_id_2"]
}
```

### **Create Kanban Column** 🆕
```javascript
POST /api/kanban/workspaces/123/kanban/columns
{
  "name": "In Review",
  "color": "#f59e0b",
  "statusMapping": ["IN_REVIEW"]
}
```

### **Create Automation Rule** 🆕
```javascript
POST /api/automations/workspaces/123/automations
{
  "name": "Auto-assign urgent tasks",
  "triggerType": "TASK_STATUS_CHANGED",
  "triggerConditions": {
    "toStatus": "IN_PROGRESS",
    "priority": "HIGH"
  },
  "actions": [{
    "type": "ASSIGN_TASK",
    "config": { "assignTo": "manager_id" },
    "order": 1
  }]
}
```

---

## 🔗 **WebSocket Events**

### **Connection**
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token',
    userId: 'user_id',
    email: 'user@example.com',
    name: 'User Name'
  }
});
```

### **Chat Events**
```javascript
// Join channels
socket.emit('join_channels', {
  workspaceId: '123',
  channelIds: ['channel1', 'channel2']
});

// Send message
socket.emit('message:send', {
  channelId: 'channel_id',
  workspaceId: 'workspace_id',
  content: 'Hello!'
});

// Listen for new messages
socket.on('message:new', (data) => {
  console.log('New message:', data.message);
});

// Typing indicators
socket.emit('typing:start', {
  channelId: 'channel_id',
  workspaceId: 'workspace_id',
  userId: 'user_id',
  userName: 'User Name'
});
```

---

## 📄 **Response Formats**

### **Success Response**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### **Paginated Response**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### **Error Response**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": {
    "field": "error description"
  }
}
```

---

## 🛡️ **Authentication Headers**

### **For Session-based Auth**
```javascript
headers: {
  'Content-Type': 'application/json',
  'Cookie': 'connect.sid=your_session_id'
}
```

### **For JWT Token (if implemented)**
```javascript
headers: {
  'Authorization': 'Bearer your_jwt_token',
  'Content-Type': 'application/json'
}
```

---

## 🚨 **Common HTTP Status Codes**

| Code | Status | Description |
|------|--------|-------------|
| `200` | OK | Request successful |
| `201` | Created | Resource created |
| `400` | Bad Request | Invalid request data |
| `401` | Unauthorized | Authentication required |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Resource conflict |
| `500` | Server Error | Internal server error |

---

## 📚 **Documentation Links**

- **Full API Documentation**: `http://localhost:3000/api-docs`
- **Completion Status**: `API_COMPLETION_STATUS.md`
- **Environment Setup**: `.env.example`

---

*Quick Reference Guide - Last Updated: September 28, 2025*