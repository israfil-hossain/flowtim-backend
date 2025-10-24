# Pricing & Subscription API

Complete pricing plans and subscription management endpoints for the Flowtim platform.

## 📋 Overview

The pricing and subscription API manages pricing plans, user subscriptions, billing cycles, and subscription limits. It integrates with Stripe for payment processing and includes comprehensive subscription lifecycle management.

## 🔐 Base URLs

```
Pricing:   http://localhost:8000/api/pricing
Subscription: http://localhost:8000/api/subscription
Payment:   http://localhost:8000/api/payment
```

## 📝 Pricing Endpoints

### 1. Get All Pricing Plans

Retrieve all active pricing plans with their features and pricing.

```http
GET /api/pricing/plans
```

**Authentication:** None (Public endpoint)

**Query Parameters:**
- `active` (boolean, optional) - Filter by active status (default: true)
- `sort` (string, optional) - Sort order (price, name, popular)

**Response (200):**
```json
{
  "status": "success",
  "message": "Pricing plans retrieved successfully",
  "data": {
    "plans": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "name": "Starter",
        "description": "Perfect for small teams getting started",
        "monthlyPrice": 0,
        "yearlyPrice": 0,
        "stripePriceIdMonthly": null,
        "stripePriceIdYearly": null,
        "features": [
          "Up to 5 team members",
          "3 projects",
          "Basic task management",
          "Email support",
          "Mobile app access",
          "Basic reporting",
          "2GB storage"
        ],
        "limitations": [
          "Limited integrations",
          "Basic analytics only"
        ],
        "maxUsers": 5,
        "maxProjects": 3,
        "maxStorage": 2,
        "isPopular": false,
        "isActive": true,
        "sortOrder": 1,
        "metadata": {
          "category": "free",
          "recommendedFor": "Small teams"
        },
        "createdAt": "2025-10-22T10:00:00.000Z",
        "updatedAt": "2025-10-22T10:00:00.000Z"
      },
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "name": "Professional",
        "description": "For growing teams that need more power",
        "monthlyPrice": 12,
        "yearlyPrice": 120,
        "stripePriceIdMonthly": "price_1Nabc...",
        "stripePriceIdYearly": "price_1Ndef...",
        "features": [
          "Up to 25 team members",
          "Unlimited projects",
          "Advanced task management",
          "Priority email support",
          "All mobile features",
          "Advanced reporting",
          "50GB storage",
          "Time tracking",
          "Custom fields",
          "Team collaboration tools",
          "API access"
        ],
        "limitations": [],
        "maxUsers": 25,
        "maxProjects": -1,
        "maxStorage": 50,
        "isPopular": true,
        "isActive": true,
        "sortOrder": 2,
        "metadata": {
          "category": "professional",
          "recommendedFor": "Growing teams"
        },
        "createdAt": "2025-10-22T10:00:00.000Z",
        "updatedAt": "2025-10-22T10:00:00.000Z"
      }
    ]
  }
}
```

### 2. Get Single Pricing Plan

Retrieve detailed information about a specific pricing plan.

```http
GET /api/pricing/plans/{id}
```

**Authentication:** None (Public endpoint)

**Path Parameters:**
- `id` (string) - Plan ID

**Response (200):**
```json
{
  "status": "success",
  "message": "Pricing plan retrieved successfully",
  "data": {
    "plan": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Professional",
      "description": "For growing teams that need more power",
      "monthlyPrice": 12,
      "yearlyPrice": 120,
      "stripePriceIdMonthly": "price_1Nabc...",
      "stripePriceIdYearly": "price_1Ndef...",
      "features": [...],
      "limitations": [],
      "maxUsers": 25,
      "maxProjects": -1,
      "maxStorage": 50,
      "isPopular": true,
      "isActive": true,
      "metadata": {
        "category": "professional",
        "recommendedFor": "Growing teams",
        "features": {
          "advancedAnalytics": true,
          "customWorkflows": true,
          "apiAccess": true,
          "prioritySupport": true,
          "customIntegrations": true
        }
      }
    }
  }
}
```

**Error Responses:**
- `404` - Plan not found

### 3. Get Pricing Comparison

Get a structured comparison of all pricing plans for easy comparison.

```http
GET /api/pricing/comparison
```

**Authentication:** None (Public endpoint)

**Response (200):**
```json
{
  "status": "success",
  "message": "Pricing comparison retrieved successfully",
  "data": {
    "comparison": {
      "plans": [
        {
          "id": "64f1a2b3c4d5e6f7g8h9i0j1",
          "name": "Starter",
          "price": {
            "monthly": 0,
            "yearly": 0
          },
          "limits": {
            "users": 5,
            "projects": 3,
            "storage": "2GB"
          },
          "features": {
            "basicTaskManagement": true,
            "emailSupport": true,
            "mobileApp": true,
            "basicReporting": true,
            "advancedAnalytics": false,
            "apiAccess": false,
            "prioritySupport": false
          }
        },
        {
          "id": "64f1a2b3c4d5e6f7g8h9i0j2",
          "name": "Professional",
          "price": {
            "monthly": 12,
            "yearly": 120,
            "savings": 20
          },
          "limits": {
            "users": 25,
            "projects": "Unlimited",
            "storage": "50GB"
          },
          "features": {
            "basicTaskManagement": true,
            "emailSupport": true,
            "mobileApp": true,
            "basicReporting": true,
            "advancedAnalytics": true,
            "apiAccess": true,
            "prioritySupport": true
          }
        }
      ],
      "featureMatrix": {
        "basicTaskManagement": {
          "Starter": true,
          "Professional": true,
          "Enterprise": true
        },
        "apiAccess": {
          "Starter": false,
          "Professional": true,
          "Enterprise": true
        }
      },
      "recommendations": {
        "smallTeams": "Starter",
        "growingTeams": "Professional",
        "largeTeams": "Enterprise"
      }
    }
  }
}
```

### 4. Create Pricing Plan (Admin)

Create a new pricing plan. Admin only endpoint.

```http
POST /api/pricing/plans
```

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "name": "Business Plan",
  "description": "Custom plan for business customers",
  "monthlyPrice": 50,
  "yearlyPrice": 500,
  "stripePriceIdMonthly": "price_1Nxyz...",
  "stripePriceIdYearly": "price_1Nzyx...",
  "features": [
    "Up to 100 team members",
    "Unlimited projects",
    "Advanced task management",
    "Priority support",
    "Custom integrations",
    "Advanced analytics",
    "100GB storage",
    "API access",
    "Custom workflows",
    "Dedicated account manager"
  ],
  "limitations": [
    "No SLA guarantee"
  ],
  "maxUsers": 100,
  "maxProjects": -1,
  "maxStorage": 100,
  "isPopular": false,
  "sortOrder": 3,
  "metadata": {
    "category": "business",
    "recommendedFor": "Large teams"
  }
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Pricing plan created successfully",
  "data": {
    "plan": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j5",
      "name": "Business Plan",
      // ... other plan fields
      "createdAt": "2025-10-22T14:00:00.000Z"
    }
  }
}
```

### 5. Update Pricing Plan (Admin)

Update an existing pricing plan. Admin only endpoint.

```http
PUT /api/pricing/plans/{id}
```

**Authentication:** Required (Admin)

**Path Parameters:**
- `id` (string) - Plan ID

**Request Body:**
```json
{
  "name": "Updated Business Plan",
  "monthlyPrice": 45,
  "yearlyPrice": 450,
  "maxUsers": 150,
  "maxStorage": 150
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Pricing plan updated successfully",
  "data": {
    "plan": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j5",
      "name": "Updated Business Plan",
      "monthlyPrice": 45,
      "yearlyPrice": 450,
      // ... other updated fields
      "updatedAt": "2025-10-22T15:00:00.000Z"
    }
  }
}
```

### 6. Delete Pricing Plan (Admin)

Deactivate a pricing plan. Admin only endpoint.

```http
DELETE /api/pricing/plans/{id}
```

**Authentication:** Required (Admin)

**Path Parameters:**
- `id` (string) - Plan ID

**Response (200):**
```json
{
  "status": "success",
  "message": "Pricing plan deactivated successfully",
  "data": {
    "deactivatedPlan": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j5",
      "name": "Business Plan",
      "isActive": false
    }
  }
}
```

## 📝 Subscription Endpoints

### 1. Get Current Subscription

Get the current active subscription for a workspace.

```http
GET /api/subscription/workspace/{workspaceId}
```

**Authentication:** Required (Session or JWT)

**Path Parameters:**
- `workspaceId` (string) - Workspace ID

**Response (200):**
```json
{
  "status": "success",
  "message": "Current subscription retrieved successfully",
  "data": {
    "subscription": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j6",
      "workspace": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j7",
        "name": "My Workspace"
      },
      "planId": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "name": "Professional",
        "maxUsers": 25,
        "maxProjects": -1,
        "maxStorage": 50
      },
      "status": "active",
      "billingCycle": "monthly",
      "stripeSubscriptionId": "sub_1Nabc...",
      "stripeCustomerId": "cus_1Ndef...",
      "currentPeriodStart": "2025-10-01T00:00:00.000Z",
      "currentPeriodEnd": "2025-11-01T00:00:00.000Z",
      "nextBillingDate": "2025-11-01T00:00:00.000Z",
      "nextBillingAmount": 1200,
      "trialStart": "2025-10-15T00:00:00.000Z",
      "trialEnd": "2025-10-29T00:00:00.000Z",
      "cancelAtPeriodEnd": false,
      "cancellationDate": null,
      "endedAt": null,
      "createdAt": "2025-10-15T00:00:00.000Z",
      "updatedAt": "2025-10-22T10:00:00.000Z",
      "usage": {
        "currentUsers": 8,
        "currentProjects": 5,
        "currentStorage": 15.5
      }
    }
  }
}
```

**Error Responses:**
- `403` - Not a workspace member
- `404` - No active subscription found

### 2. Get All User Subscriptions

Get all subscriptions across all workspaces for the authenticated user.

```http
GET /api/subscription/all
```

**Authentication:** Required (Session or JWT)

**Query Parameters:**
- `status` (string, optional) - Filter by status (active, trial, cancelled, expired)
- `page` (number, optional) - Page number
- `limit` (number, optional) - Items per page

**Response (200):**
```json
{
  "status": "success",
  "message": "Subscriptions retrieved successfully",
  "data": {
    "subscriptions": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j6",
        "workspace": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j7",
          "name": "My Workspace"
        },
        "planId": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
          "name": "Professional"
        },
        "status": "active",
        "billingCycle": "monthly",
        "nextBillingDate": "2025-11-01T00:00:00.000Z",
        "nextBillingAmount": 1200
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### 3. Create Subscription

Create a new subscription for a workspace.

```http
POST /api/subscription/create
```

**Authentication:** Required (Session or JWT)

**Request Body:**
```json
{
  "workspaceId": "64f1a2b3c4d5e6f7g8h9i0j7",
  "planId": "64f1a2b3c4d5e6f7g8h9i0j2",
  "billingCycle": "monthly",
  "isTrial": true,
  "paymentMethodId": "pm_1Nabc...",
  "customerId": "cus_1Ndef..."
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Subscription created successfully",
  "data": {
    "subscription": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j6",
      "workspace": "64f1a2b3c4d5e6f7g8h9i0j7",
      "planId": "64f1a2b3c4d5e6f7g8h9i0j2",
      "status": "trial",
      "billingCycle": "monthly",
      "stripeSubscriptionId": "sub_1Nabc...",
      "trialStart": "2025-10-22T10:00:00.000Z",
      "trialEnd": "2025-11-05T10:00:00.000Z",
      "createdAt": "2025-10-22T10:00:00.000Z"
    },
    "checkoutUrl": "https://checkout.stripe.com/pay/..."
  }
}
```

**Error Responses:**
- `400` - Validation error
- `403` - Workspace access denied
- `409` - Subscription already exists
- `422` - Plan limits exceeded

### 4. Update Subscription

Update an existing subscription (upgrade/downgrade).

```http
PUT /api/subscription/{subscriptionId}
```

**Authentication:** Required (Session or JWT)

**Path Parameters:**
- `subscriptionId` (string) - Subscription ID

**Request Body:**
```json
{
  "planId": "64f1a2b3c4d5e6f7g8h9i0j3",
  "billingCycle": "yearly",
  "prorate": true
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Subscription updated successfully",
  "data": {
    "subscription": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j6",
      "planId": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
        "name": "Enterprise"
      },
      "status": "active",
      "billingCycle": "yearly",
      "nextBillingAmount": 2400,
      "updatedAt": "2025-10-22T15:00:00.000Z"
    },
    "invoice": {
      "id": "in_1Nxyz...",
      "amount": 600,
      "description": "Plan upgrade proration"
    }
  }
}
```

### 5. Cancel Subscription

Cancel an active subscription.

```http
POST /api/subscription/{subscriptionId}/cancel
```

**Authentication:** Required (Session or JWT)

**Path Parameters:**
- `subscriptionId` (string) - Subscription ID

**Request Body:**
```json
{
  "cancelAtPeriodEnd": true,
  "reason": "No longer needed",
  "feedback": "The features are great but we're scaling down"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Subscription cancelled successfully",
  "data": {
    "subscription": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j6",
      "status": "cancelled",
      "cancelAtPeriodEnd": true,
      "cancellationDate": "2025-10-22T15:00:00.000Z",
      "endDate": "2025-11-01T00:00:00.000Z",
      "updatedAt": "2025-10-22T15:00:00.000Z"
    }
  }
}
```

### 6. Reactivate Subscription

Reactivate a cancelled subscription.

```http
POST /api/subscription/{subscriptionId}/reactivate
```

**Authentication:** Required (Session or JWT)

**Path Parameters:**
- `subscriptionId` (string) - Subscription ID

**Response (200):**
```json
{
  "status": "success",
  "message": "Subscription reactivated successfully",
  "data": {
    "subscription": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j6",
      "status": "active",
      "cancelAtPeriodEnd": false,
      "cancellationDate": null,
      "reactivatedAt": "2025-10-22T16:00:00.000Z",
      "updatedAt": "2025-10-22T16:00:00.000Z"
    }
  }
}
```

### 7. Get Workspace Subscription Limits

Get current usage and limits for a workspace.

```http
GET /api/subscription/workspace/{workspaceId}/limits
```

**Authentication:** Required (Session or JWT)

**Path Parameters:**
- `workspaceId` (string) - Workspace ID

**Response (200):**
```json
{
  "status": "success",
  "message": "Workspace limits retrieved successfully",
  "data": {
    "limits": {
      "maxUsers": 25,
      "maxProjects": -1,
      "maxStorage": 50,
      "currentUsers": 8,
      "currentProjects": 5,
      "currentStorage": 15.5,
      "usagePercentage": {
        "users": 32,
        "projects": 0,
        "storage": 31
      },
      "canAccessAdvancedFeatures": true,
      "canAccessApi": true,
      "canCreateCustomIntegrations": true,
      "hasPrioritySupport": true,
      "subscriptionStatus": "active",
      "planName": "Professional",
      "trialEnd": null,
      "nextBillingDate": "2025-11-01T00:00:00.000Z"
    }
  }
}
```

### 8. Check User Limit

Check if workspace can add more users.

```http
POST /api/subscription/workspace/{workspaceId}/check-users
```

**Authentication:** Required (Session or JWT)

**Path Parameters:**
- `workspaceId` (string) - Workspace ID

**Request Body:**
```json
{
  "additionalUsers": 3
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "User limit check completed",
  "data": {
    "canAddUsers": true,
    "currentUsers": 8,
    "maxUsers": 25,
    "availableSlots": 17,
    "requestedSlots": 3,
    "planName": "Professional"
  }
}
```

**Error Response (limit exceeded):**
```json
{
  "status": "error",
  "message": "User limit exceeded",
  "error": "USER_LIMIT_EXCEEDED",
  "data": {
    "currentUsers": 25,
    "maxUsers": 25,
    "requestedUsers": 1,
    "availableSlots": 0,
    "suggestion": "Upgrade to Enterprise plan for unlimited users"
  }
}
```

### 9. Check Project Limit

Check if workspace can add more projects.

```http
POST /api/subscription/workspace/{workspaceId}/check-projects
```

**Authentication:** Required (Session or JWT)

**Path Parameters:**
- `workspaceId` (string) - Workspace ID

**Request Body:**
```json
{
  "additionalProjects": 2
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Project limit check completed",
  "data": {
    "canAddProjects": true,
    "currentProjects": 5,
    "maxProjects": -1,
    "unlimited": true,
    "planName": "Professional"
  }
}
```

## 📝 Payment Endpoints

### 1. Get Payment History

Get paginated payment history for the authenticated user.

```http
GET /api/payment/history
```

**Authentication:** Required (Session or JWT)

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 10)
- `status` (string, optional) - Filter by status
- `startDate` (string, optional) - Filter start date (ISO 8601)
- `endDate` (string, optional) - Filter end date (ISO 8601)

**Response (200):**
```json
{
  "status": "success",
  "message": "Payment history retrieved successfully",
  "data": {
    "payments": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j8",
        "subscriptionId": "64f1a2b3c4d5e6f7g8h9i0j6",
        "workspace": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j7",
          "name": "My Workspace"
        },
        "amount": 1200,
        "currency": "usd",
        "status": "succeeded",
        "description": "Professional Plan - Monthly",
        "paymentMethod": {
          "type": "card",
          "brand": "visa",
          "last4": "4242"
        },
        "stripePaymentIntentId": "pi_1Nabc...",
        "stripeInvoiceId": "in_1Ndef...",
        "invoiceUrl": "https://invoice.stripe.com/...",
        "createdAt": "2025-10-01T00:00:00.000Z",
        "refunded": false,
        "refundedAmount": 0,
        "refunds": []
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

### 2. Get Payment Statistics

Get payment statistics and summaries for the authenticated user.

```http
GET /api/payment/stats
```

**Authentication:** Required (Session or JWT)

**Query Parameters:**
- `period` (string, optional) - Time period (7d, 30d, 90d, 1y, all)

**Response (200):**
```json
{
  "status": "success",
  "message": "Payment statistics retrieved successfully",
  "data": {
    "totalPaid": 14400,
    "thisMonth": 1200,
    "lastMonth": 1200,
    "thisYear": 14400,
    "totalPayments": 12,
    "successfulPayments": 12,
    "failedPayments": 0,
    "successRate": 100,
    "averagePayment": 1200,
    "currency": "usd",
    "monthlySpending": [
      {
        "month": "2025-10",
        "amount": 1200,
        "payments": 1
      },
      {
        "month": "2025-09",
        "amount": 1200,
        "payments": 1
      }
    ],
    "paymentsByStatus": {
      "succeeded": 12,
      "failed": 0,
      "pending": 0,
      "refunded": 0
    },
    "topWorkspaces": [
      {
        "workspaceId": "64f1a2b3c4d5e6f7g8h9i0j7",
        "workspaceName": "My Workspace",
        "totalSpent": 14400,
        "paymentsCount": 12
      }
    ]
  }
}
```

### 3. Get Single Payment

Get details of a specific payment.

```http
GET /api/payment/{paymentId}
```

**Authentication:** Required (Session or JWT)

**Path Parameters:**
- `paymentId` (string) - Payment ID

**Response (200):**
```json
{
  "status": "success",
  "message": "Payment retrieved successfully",
  "data": {
    "payment": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j8",
      "subscriptionId": "64f1a2b3c4d5e6f7g8h9i0j6",
      "workspace": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j7",
        "name": "My Workspace"
      },
      "amount": 1200,
      "currency": "usd",
      "status": "succeeded",
      "description": "Professional Plan - Monthly",
      "paymentMethod": {
        "type": "card",
        "brand": "visa",
        "last4": "4242",
        "expMonth": 12,
        "expYear": 2025
      },
      "billingAddress": {
        "name": "John Doe",
        "email": "john@example.com",
        "address": {
          "line1": "123 Main St",
          "city": "San Francisco",
          "state": "CA",
          "postalCode": "94105",
          "country": "US"
        }
      },
      "stripePaymentIntentId": "pi_1Nabc...",
      "stripeInvoiceId": "in_1Ndef...",
      "invoiceUrl": "https://invoice.stripe.com/...",
      "createdAt": "2025-10-01T00:00:00.000Z",
      "processedAt": "2025-10-01T00:05:00.000Z",
      "refunded": false,
      "refundedAmount": 0,
      "refunds": [],
      "metadata": {
        "planName": "Professional",
        "billingCycle": "monthly"
      }
    }
  }
}
```

## 📊 Data Models

### Pricing Plan Object
```json
{
  "_id": "string",
  "name": "string",
  "description": "string",
  "monthlyPrice": "number",
  "yearlyPrice": "number",
  "stripePriceIdMonthly": "string",
  "stripePriceIdYearly": "string",
  "features": ["string"],
  "limitations": ["string"],
  "maxUsers": "number",
  "maxProjects": "number",
  "maxStorage": "number",
  "isPopular": "boolean",
  "isActive": "boolean",
  "sortOrder": "number",
  "metadata": "object",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### Subscription Object
```json
{
  "_id": "string",
  "workspace": "string",
  "planId": "object",
  "status": "active|trial|cancelled|expired|past_due",
  "billingCycle": "monthly|yearly",
  "stripeSubscriptionId": "string",
  "stripeCustomerId": "string",
  "currentPeriodStart": "string",
  "currentPeriodEnd": "string",
  "nextBillingDate": "string",
  "nextBillingAmount": "number",
  "trialStart": "string",
  "trialEnd": "string",
  "cancelAtPeriodEnd": "boolean",
  "cancellationDate": "string",
  "endedAt": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### Payment Object
```json
{
  "_id": "string",
  "subscriptionId": "string",
  "workspace": "object",
  "amount": "number",
  "currency": "string",
  "status": "succeeded|failed|pending|refunded",
  "description": "string",
  "paymentMethod": "object",
  "stripePaymentIntentId": "string",
  "stripeInvoiceId": "string",
  "invoiceUrl": "string",
  "createdAt": "string",
  "processedAt": "string",
  "refunded": "boolean",
  "refundedAmount": "number",
  "refunds": ["object"],
  "metadata": "object"
}
```

## 🔒 Security & Validation

### Input Validation
- Plan IDs must be valid MongoDB ObjectIds
- Billing cycles limited to 'monthly' or 'yearly'
- Subscription status validation
- Amount and currency validation
- Stripe ID format validation

### Security Measures
- Stripe signature verification for webhooks
- PCI compliance through Stripe integration
- No raw payment data storage
- Secure API key management
- Role-based access control

### Rate Limiting
- Pricing endpoints: 100 requests/minute
- Subscription updates: 10 requests/minute
- Payment history: 50 requests/minute
- Admin endpoints: 20 requests/minute

## 🔄 Webhooks

### Stripe Webhook Events

The system handles these Stripe webhook events:

```http
POST /api/stripe/webhook
```

**Events Handled:**
- `customer.subscription.created` - New subscription created
- `customer.subscription.updated` - Subscription updated
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_succeeded` - Payment successful
- `invoice.payment_failed` - Payment failed
- `checkout.session.completed` - Checkout completed

**Webhook Security:**
- Signature verification using Stripe webhook secret
- Event idempotency handling
- Error logging and monitoring

## 🚨 Error Handling

### Subscription Errors

**Plan Not Found:**
```json
{
  "status": "error",
  "message": "Pricing plan not found",
  "error": "PLAN_NOT_FOUND",
  "planId": "64f1a2b3c4d5e6f7g8h9i0j9"
}
```

**Subscription Exists:**
```json
{
  "status": "error",
  "message": "Workspace already has an active subscription",
  "error": "SUBSCRIPTION_EXISTS",
  "workspaceId": "64f1a2b3c4d5e6f7g8h9i0j7"
}
```

**Limit Exceeded:**
```json
{
  "status": "error",
  "message": "User limit exceeded",
  "error": "USER_LIMIT_EXCEEDED",
  "current": 25,
  "limit": 25,
  "requested": 1
}
```

### Payment Errors

**Payment Failed:**
```json
{
  "status": "error",
  "message": "Payment processing failed",
  "error": "PAYMENT_FAILED",
  "stripeError": {
    "type": "card_error",
    "code": "insufficient_funds",
    "message": "Insufficient funds on card"
  }
}
```

**Payment Not Found:**
```json
{
  "status": "error",
  "message": "Payment record not found",
  "error": "PAYMENT_NOT_FOUND",
  "paymentId": "64f1a2b3c4d5e6f7g8h9i0j9"
}
```

## 🧪 Testing

### Example Test Cases
```javascript
describe('Pricing API', () => {
  test('should get all pricing plans', async () => {
    const response = await request(app)
      .get('/api/pricing/plans')
      .expect(200);

    expect(response.body.data.plans).toBeInstanceOf(Array);
    expect(response.body.data.plans.length).toBeGreaterThan(0);
  });

  test('should create subscription', async () => {
    const response = await request(app)
      .post('/api/subscription/create')
      .set('Cookie', authCookie)
      .send({
        workspaceId: '64f1a2b3c4d5e6f7g8h9i0j7',
        planId: '64f1a2b3c4d5e6f7g8h9i0j2',
        billingCycle: 'monthly',
        isTrial: true
      })
      .expect(201);

    expect(response.body.data.subscription.status).toBe('trial');
  });
});
```

## 📱 Client Integration

### React Hook for Subscription
```javascript
import { useState, useEffect } from 'react';
import api from '@/services/api';

export function useSubscription(workspaceId) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await api.get(`/subscription/workspace/${workspaceId}`);
        setSubscription(response.data.data.subscription);
      } catch (err) {
        setError(err.response.data);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [workspaceId]);

  const upgradePlan = async (newPlanId) => {
    try {
      const response = await api.put(`/subscription/${subscription._id}`, {
        planId: newPlanId
      });
      setSubscription(response.data.data.subscription);
      return response.data;
    } catch (err) {
      throw err.response.data;
    }
  };

  return {
    subscription,
    loading,
    error,
    upgradePlan,
    cancel: () => api.post(`/subscription/${subscription._id}/cancel`),
    reactivate: () => api.post(`/subscription/${subscription._id}/reactivate`)
  };
}
```

---

**Related Documentation:**
- [Payment API](./PAYMENT_API.md)
- [Webhook API](./WEBHOOK_API.md)
- [User API](./USER_API.md)
- [Main API Documentation](./API_DOCUMENTATION.md)