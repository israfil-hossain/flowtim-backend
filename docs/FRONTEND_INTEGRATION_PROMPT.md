# Flowtim Frontend Integration Prompt

## Overview
This document provides comprehensive API endpoints and integration instructions for implementing the **Discount Management System**, **Referral Program**, and **Role-Based Access Control (RBAC)** in the Flowtim frontend application.

## Base API Configuration
```
Base URL: https://api.flowtim.com
Environment: Production
Authentication: Bearer Token (JWT)
```

---

## 1. Discount Management System

### API Endpoints

#### Get All Discounts (Admin)
```http
GET /api/discount/all
Authorization: Bearer {token}
Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- status: "active" | "inactive" | "expired" (optional)
- type: "percentage" | "fixed_amount" (optional)
- search: string (optional)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "discounts": [
      {
        "_id": "64a1b2c3d4e5f6789012345",
        "name": "Summer Sale 2025",
        "description": "25% off all plans",
        "type": "percentage",
        "value": 25,
        "code": "SUMMER2025",
        "isActive": true,
        "appliesTo": "all_plans",
        "applicablePlans": [],
        "maxUses": 100,
        "usedCount": 45,
        "minAmount": 10,
        "maxDiscountAmount": 50,
        "startDate": "2025-01-01T00:00:00.000Z",
        "endDate": "2025-12-31T23:59:59.999Z",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z",
        "createdBy": {
          "_id": "user_id",
          "name": "Admin User",
          "email": "admin@flowtim.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Create Discount (Admin)
```http
POST /api/discount/create
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Year Sale",
  "description": "30% off professional plan",
  "type": "percentage",
  "value": 30,
  "code": "NEWYEAR2025",
  "appliesTo": "specific_plans",
  "applicablePlans": ["plan_id_1", "plan_id_2"],
  "maxUses": 50,
  "minAmount": 20,
  "maxDiscountAmount": 100,
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2025-01-31T23:59:59.999Z",
  "metadata": {
    "category": "seasonal",
    "targetAudience": "new_users",
    "internalNotes": "New year promotion"
  }
}
```

#### Update Discount (Admin)
```http
PUT /api/discount/{discountId}
Authorization: Bearer {token}
Content-Type: application/json
```

#### Delete Discount (Admin)
```http
DELETE /api/discount/{discountId}?hardDelete=false
Authorization: Bearer {token}
```

#### Get Discount Statistics (Admin)
```http
GET /api/discount/stats
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalDiscounts": 25,
      "activeDiscounts": 18,
      "totalUsedCount": 342,
      "percentageDiscounts": 15,
      "fixedDiscounts": 10,
      "avgUsageRate": 68
    },
    "typeBreakdown": [
      {
        "_id": "percentage",
        "count": 15,
        "totalUsed": 245
      },
      {
        "_id": "fixed_amount",
        "count": 10,
        "totalUsed": 97
      }
    ],
    "appliesToBreakdown": [
      {
        "_id": "all_plans",
        "count": 12,
        "totalUsed": 189
      },
      {
        "_id": "specific_plans",
        "count": 8,
        "totalUsed": 89
      }
    ]
  }
}
```

#### Get Public Discounts
```http
GET /api/discount/public
```

---

## 2. Referral Program System

### API Endpoints

#### Create Referral
```http
POST /api/referral/create
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "referredEmail": "friend@example.com",
  "metadata": {
    "source": "user_dashboard",
    "customMessage": "Join me on FlowTim!"
  }
}
```

#### Get User Referrals
```http
GET /api/referral/my-referrals
Authorization: Bearer {token}
Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- status: "pending" | "completed" | "rewarded" | "expired" (optional)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "referrals": [
      {
        "_id": "64a1b2c3d4e5f6789012346",
        "referralCode": "USER123ABC",
        "referredEmail": "friend@example.com",
        "status": "completed",
        "referredUser": {
          "_id": "user_ref_id",
          "name": "Friend Name",
          "email": "friend@example.com"
        },
        "createdAt": "2025-01-01T00:00:00.000Z",
        "completedAt": "2025-01-02T00:00:00.000Z",
        "expiresAt": "2025-01-31T23:59:59.999Z",
        "metadata": {
          "source": "user_dashboard"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

#### Get Referral Statistics
```http
GET /api/referral/stats
Authorization: Bearer {token}
Query Parameters:
- period: "all" | "7d" | "30d" | "90d" (default: "all")
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalReferrals": 5,
      "completedReferrals": 3,
      "pendingReferrals": 1,
      "expiredReferrals": 1,
      "canClaimReward": true,
      "claimedReward": false,
      "nextRewardThreshold": 3,
      "rewardProgress": 100
    },
    "monthlyStats": [
      {
        "month": "2025-01",
        "referrals": 3,
        "completed": 2
      }
    ]
  }
}
```

#### Claim Referral Reward
```http
POST /api/referral/claim-reward
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Reward claimed successfully! Enjoy your 1-month premium subscription.",
  "data": {
    "rewardType": "1_month_premium",
    "rewardValue": {
      "planId": "professional_plan_id",
      "duration": 1,
      "credits": 0
    },
    "claimedAt": "2025-01-15T00:00:00.000Z"
  }
}
```

#### Complete Referral (Public - Used during signup)
```http
POST /api/referral/complete
Content-Type: application/json
```

**Request Body:**
```json
{
  "referralCode": "USER123ABC",
  "referredUserId": "new_user_id"
}
```

#### Lookup Referral Code (Public)
```http
GET /api/referral/lookup/{code}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "referral": {
      "_id": "ref_id",
      "referralCode": "USER123ABC",
      "referrerUser": {
        "_id": "referrer_id",
        "name": "Referrer Name"
      },
      "expiresAt": "2025-01-31T23:59:59.999Z",
      "isActive": true
    },
    "message": "Valid referral code found!"
  }
}
```

---

## 3. Role-Based Access Control (RBAC)

### API Endpoints

#### Get Current User with Permissions
```http
GET /api/user/current
Authorization: Bearer {token}
```

**Enhanced Response with Role Permissions:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "isAdmin": true,
      "rolePermissions": {
        "_id": "role_id",
        "name": "super_admin",
        "displayName": "Super Admin",
        "level": 1,
        "permissions": {
          "admin": {
            "dashboard": true,
            "users": {
              "read": true,
              "create": true,
              "update": true,
              "delete": true,
              "manageRoles": true
            },
            "discounts": {
              "read": true,
              "create": true,
              "update": true,
              "delete": true
            },
            "referrals": {
              "read": true,
              "manage": true
            },
            "billing": {
              "read": true,
              "manage": true
            },
            "analytics": {
              "read": true
            },
            "settings": {
              "read": true,
              "update": true
            }
          }
        }
      },
      "referralCode": "JOHN123ABC",
      "referredBy": null,
      "referralRewardClaimed": false
    }
  }
}
```

#### Check User Permission
```http
POST /api/user/check-permission
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "permissionPath": "admin.discounts.create"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hasPermission": true,
    "permissionPath": "admin.discounts.create"
  }
}
```

---

## 4. Frontend Implementation Guidelines

### Authentication Setup
```javascript
// API Configuration
const API_BASE_URL = 'https://api.flowtim.com';

// Axios Configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request Interceptor for Authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### React Components Structure

#### 1. Discount Management Component
```jsx
// src/components/admin/DiscountManagement.jsx
import React, { useState, useEffect } from 'react';
import {
  getAllDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getDiscountStats
} from '../api/discount';

const DiscountManagement = () => {
  const [discounts, setDiscounts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Component implementation with:
  // - Discount listing with filters
  // - Create/Edit/Delete dialogs
  // - Statistics dashboard
  // - Usage tracking display

  return (
    <div className="discount-management">
      {/* Component JSX */}
    </div>
  );
};
```

#### 2. Referral Dashboard Component
```jsx
// src/components/user/ReferralDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  getUserReferrals,
  getReferralStats,
  createReferral,
  claimReferralReward
} from '../api/referral';

const ReferralDashboard = () => {
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState(null);
  const [userReferralCode, setUserReferralCode] = useState('');

  // Component implementation with:
  // - Referral progress tracking
  // - Share functionality
  // - Reward claiming interface
  // - Referral history table

  return (
    <div className="referral-dashboard">
      {/* Component JSX */}
    </div>
  );
};
```

### Permission-Based Routing
```jsx
// src/components/ProtectedRoute.jsx
import React from 'react';
import { useCurrentUser } from '../hooks/useAuth';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) return <div>Loading...</div>;

  if (!user || !user.rolePermissions) {
    return <div>Access Denied</div>;
  }

  const hasPermission = checkPermission(user.rolePermissions, requiredPermission);

  if (!hasPermission) {
    return <div>Insufficient Permissions</div>;
  }

  return children;
};

// Usage example:
<ProtectedRoute requiredPermission="admin.discounts.read">
  <DiscountManagement />
</ProtectedRoute>
```

### Permission Checking Utility
```javascript
// src/utils/permissions.js
export const checkPermission = (rolePermissions, permissionPath) => {
  const permissions = rolePermissions.permissions;
  const pathParts = permissionPath.split('.');

  let currentLevel = permissions;

  for (const part of pathParts) {
    if (currentLevel[part] === undefined) {
      return false;
    }

    if (typeof currentLevel[part] === 'boolean') {
      return currentLevel[part];
    }

    if (typeof currentLevel[part] === 'object') {
      currentLevel = currentLevel[part];
    } else {
      return false;
    }
  }

  return false;
};
```

### State Management with TanStack Query
```javascript
// src/hooks/useDiscounts.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { discountAPI } from '../api/discount';

export const useDiscounts = (filters) => {
  return useQuery({
    queryKey: ['discounts', filters],
    queryFn: () => discountAPI.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: discountAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      queryClient.invalidateQueries({ queryKey: ['discount-stats'] });
    },
  });
};
```

---

## 5. UI/UX Design Guidelines

### Discount Management UI
- **Dashboard**: Show overview cards with total discounts, active discounts, usage statistics
- **Table**: Display discounts with name, type, value, code, status, usage progress
- **Filters**: Status (active/inactive), type (percentage/fixed), search functionality
- **Create/Edit Form**: Comprehensive form with validation for all discount fields
- **Actions**: Edit, delete (soft/hard), activate/deactivate buttons

### Referral Dashboard UI
- **Progress Bar**: Visual representation of referral progress toward reward
- **Stats Cards**: Total referrals, completed referrals, reward status
- **Share Section**: Referral link with copy button and social sharing options
- **Referral Table**: History of referred users with status indicators
- **Reward Claim**: Prominent call-to-action when reward is available

### Permission-Based UI
- **Role-Based Navigation**: Show/hide menu items based on user permissions
- **Component Guards**: Wrap admin components with permission checks
- **Action Buttons**: Show/hide CRUD buttons based on specific permissions
- **Access Denied Pages**: User-friendly messages for insufficient permissions

---

## 6. Error Handling & Loading States

### API Error Handling
```javascript
// Global error handler
const handleApiError = (error) => {
  if (error.response) {
    // Server error
    const { status, data } = error.response;

    switch (status) {
      case 401:
        // Redirect to login
        window.location.href = '/login';
        break;
      case 403:
        toast.error('Access denied');
        break;
      case 404:
        toast.error('Resource not found');
        break;
      default:
        toast.error(data.message || 'An error occurred');
    }
  } else if (error.request) {
    toast.error('Network error. Please try again.');
  } else {
    toast.error('An unexpected error occurred');
  }
};
```

### Loading States
- Use skeleton loaders for data tables
- Show loading spinners for async operations
- Disable buttons during form submissions
- Provide progress indicators for file uploads

---

## 7. Testing Considerations

### Unit Tests
- Test API service functions
- Test permission checking utilities
- Test component rendering with different permission levels

### Integration Tests
- Test discount creation, editing, and deletion flow
- Test referral program workflow
- Test role-based access control

### E2E Tests
- Complete user journey through referral program
- Admin discount management workflow
- Permission-based access scenarios

---

## 8. Deployment Checklist

### Environment Variables
```env
REACT_APP_API_BASE_URL=https://api.flowtim.com
REACT_APP_FRONTEND_URL=https://flowtim.com
```

### Build Configuration
- Ensure proper CORS settings
- Configure API base URL for production
- Set up proper error reporting
- Configure analytics tracking

### Security Considerations
- Sanitize all user inputs
- Validate discount codes on both client and server
- Implement rate limiting for referral creation
- Use HTTPS for all API calls

---

## 9. Feature Implementation Priority

### Phase 1: Core Functionality
1. Basic discount management (CRUD operations)
2. Referral program core features
3. Role-based access control implementation

### Phase 2: Enhanced Features
1. Advanced discount filtering and search
2. Social sharing for referrals
3. Comprehensive analytics dashboards

### Phase 3: Advanced Features
1. Automated discount campaigns
2. Referral program gamification
3. Advanced role management interface

This comprehensive guide provides all the necessary information to successfully integrate the discount management system, referral program, and role-based access control into your Flowtim frontend application.