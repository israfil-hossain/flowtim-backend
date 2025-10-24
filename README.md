# Flowtim Backend API

A robust Node.js/TypeScript backend API for Flowtim - a SaaS project management and time tracking application built with MongoDB, Express, and TypeScript.

## 🏗️ Architecture Overview

This application follows a **Layered Architecture** pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (REST)                          │
│  Controllers → Routes → Middleware → Validation            │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                  Service Layer                             │
│  Business Logic → Data Processing → External Integrations  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                  Data Access Layer                         │
│  Models → Schemas → Database Queries → MongoDB             │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
flowtim-backend/
├── src/
│   ├── @types/           # TypeScript type definitions
│   ├── config/          # Application configuration
│   ├── controllers/     # Request handlers (API Layer)
│   ├── enums/          # Application enums/constants
│   ├── middlewares/    # Express middleware functions
│   ├── models/         # MongoDB schemas and models
│   ├── routes/         # Express route definitions
│   ├── seeders/        # Database seeding scripts
│   ├── services/       # Business logic layer
│   ├── utils/          # Utility functions
│   └── validation/     # Input validation schemas
├── dist/               # Compiled JavaScript output
├── node_modules/       # Dependencies
├── .env.example        # Environment variables template
├── .gitignore         # Git ignore rules
├── package.json       # Project dependencies
├── tsconfig.json      # TypeScript configuration
└── README.md          # This file
```

## 🚀 Technology Stack

### Core Technologies
- **Runtime**: Node.js (v18+)
- **Language**: TypeScript 5.x
- **Framework**: Express.js 4.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js with JWT strategy

### Development Tools
- **Build Tool**: TypeScript Compiler (tsc)
- **Package Manager**: npm/yarn
- **Environment**: dotenv for configuration management

### Key Dependencies
- **express**: Web framework
- **mongoose**: MongoDB object modeling
- **passport**: Authentication middleware
- **jsonwebtoken**: JWT token handling
- **bcrypt**: Password hashing
- **joi**: Input validation
- **helmet**: Security middleware
- **cors**: Cross-origin resource sharing

## 🔧 Configuration

### Environment Variables
Create a `.env` file based on `.env.example`:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/flowtim
DB_NAME=flowtim

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## 🏛️ Domain Models

### Core Entities
- **User**: Application users with authentication
- **Workspace**: Organizational units for projects
- **Project**: Individual projects within workspaces
- **Task**: Tasks assigned to projects
- **Member**: Workspace/project members with roles
- **Account**: OAuth/social login accounts

### Relationships
```
User ──┬─ Account (1:N)
       ├─ Member (1:N)
       └─ Task (1:N)

Workspace ──┬─ Member (1:N)
            ├─ Project (1:N)
            └─ User (N:M through Member)

Project ──┬─ Task (1:N)
          └─ Member (N:M)

Task ──┬─ User (N:M assignee)
       └─ Project (N:1)
```

## 🔐 Authentication & Authorization

### JWT-based Authentication
- **Access Tokens**: Short-lived JWT tokens for API access
- **Refresh Tokens**: Long-lived tokens for token renewal
- **Role-based Access Control (RBAC)**: 
  - SUPER_ADMIN: Full system access
  - WORKSPACE_ADMIN: Workspace management
  - PROJECT_MANAGER: Project oversight
  - MEMBER: Standard user access

### Permission System
```typescript
enum Permission {
  // User permissions
  USER_CREATE = 'USER_CREATE',
  USER_READ = 'USER_READ',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  
  // Workspace permissions
  WORKSPACE_CREATE = 'WORKSPACE_CREATE',
  WORKSPACE_READ = 'WORKSPACE_READ',
  WORKSPACE_UPDATE = 'WORKSPACE_UPDATE',
  WORKSPACE_DELETE = 'WORKSPACE_DELETE',
  
  // Project permissions
  PROJECT_CREATE = 'PROJECT_CREATE',
  PROJECT_READ = 'PROJECT_READ',
  PROJECT_UPDATE = 'PROJECT_UPDATE',
  PROJECT_DELETE = 'PROJECT_DELETE',
  
  // Task permissions
  TASK_CREATE = 'TASK_CREATE',
  TASK_READ = 'TASK_READ',
  TASK_UPDATE = 'TASK_UPDATE',
  TASK_DELETE = 'TASK_DELETE'
}
```

## 🔄 API Endpoints

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Workspace Routes
- `GET /api/workspaces` - List user workspaces
- `POST /api/workspaces` - Create new workspace
- `GET /api/workspaces/:id` - Get workspace details
- `PUT /api/workspaces/:id` - Update workspace
- `DELETE /api/workspaces/:id` - Delete workspace

### Project Routes
- `GET /api/projects` - List projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Task Routes
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## 🛡️ Security Features

### Input Validation
- **Joi schemas** for request body validation
- **Sanitization** of user inputs
- **Rate limiting** on authentication endpoints

### Security Headers
- **Helmet.js** for security headers
- **CORS** configuration for cross-origin requests
- **Content Security Policy (CSP)**

### Data Protection
- **Password hashing** with bcrypt
- **Sensitive data encryption** at rest
- **HTTPS enforcement** in production

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn package manager

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd flowtim-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB
mongod

# Run database seeders
npm run seed

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev          # Start development server with nodemon
npm run build        # Build for production
npm start           # Start production server
npm run seed        # Run database seeders
npm run test        # Run test suite
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
```

## 🧪 Testing Strategy

### Unit Tests
- Service layer business logic
- Utility functions
- Model validations

### Integration Tests
- API endpoint testing
- Database operations
- Authentication flows

### Test Structure
```
tests/
├── unit/
│   ├── services/
│   ├── utils/
│   └── models/
├── integration/
│   ├── routes/
│   └── auth/
└── fixtures/
    └── test-data.ts
```

## 📊 Database Design

### MongoDB Collections
- **users**: User accounts and profiles
- **workspaces**: Workspace information
- **projects**: Project details
- **tasks**: Task information and status
- **members**: Workspace/project memberships
- **accounts**: OAuth/social login data
- **roles_permissions**: Role-based permissions

### Indexes
```javascript
// Performance indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.workspaces.createIndex({ slug: 1 }, { unique: true });
db.projects.createIndex({ workspaceId: 1, slug: 1 });
db.tasks.createIndex({ projectId: 1, status: 1 });
```

## 🚢 Deployment

### Docker Deployment
```bash
# Build and run with Docker
docker-compose up --build
```

### Production Checklist
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database indexes created
- [ ] Rate limiting enabled
- [ ] Error monitoring setup (Sentry)
- [ ] Logging configured (Winston)
- [ ] Health check endpoints
- [ ] Backup strategy implemented

## 📈 Monitoring & Observability

### Health Checks
- `GET /health` - Application health status
- `GET /health/db` - Database connectivity check

### Logging
- **Winston** for structured logging
- **Log levels**: error, warn, info, debug
- **Correlation IDs** for request tracking

### Metrics
- **Response times** per endpoint
- **Error rates** and types
- **Database query performance**
- **Authentication success/failure rates**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@flowtim.com or join our Slack channel.
