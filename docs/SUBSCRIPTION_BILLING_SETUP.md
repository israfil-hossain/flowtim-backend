# Subscription & Billing Setup Guide

## 🚀 Quick Setup

### 1. Environment Configuration

Copy the `.env.example` to `.env` and configure the following variables:

```bash
# Required Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here

# Subscription Configuration
DEFAULT_TRIAL_DAYS=14
SUBSCRIPTION_RENEWAL_REMINDER_DAYS=7
FAILED_PAYMENT_RETRY_DAYS=3
```

### 2. Stripe Setup

#### Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers > API keys**
3. Copy your **Secret key** and **Publishable key**
4. Add them to your `.env` file

#### Create Subscription Products

1. In Stripe Dashboard, go to **Products**
2. Create these subscription products:
   - **Starter** ($0/month)
   - **Professional** ($29/month)
   - **Enterprise** ($99/month)

3. For each product, create monthly and yearly prices:
   - Professional: $29/month, $290/year (2 months free)
   - Enterprise: $99/month, $990/year (2 months free)

4. Note down the Price IDs and add them to your database

#### Configure Webhooks

1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Add webhook endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `invoice.payment_action_required`
   - `invoice.upcoming`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `customer.created`
   - `invoice.finalized`
   - `invoice.marked_uncollectible`

4. Copy the webhook signing secret and add to `.env`

### 3. Database Setup

Run the subscription plan seeder to create default plans:

```bash
npm run seed:subscription-plans
```

Or manually insert plans in your MongoDB:

```javascript
// Insert into subscriptionplans collection
[
  {
    name: "Starter",
    description: "Perfect for small teams and personal projects",
    monthlyPrice: 0,
    yearlyPrice: 0,
    stripePriceIdMonthly: "price_xxx", // Your Stripe price ID
    stripePriceIdYearly: "price_yyy",  // Your Stripe price ID
    features: [
      "Up to 5 users",
      "Up to 3 projects",
      "2GB storage",
      "Basic features"
    ],
    maxUsers: 5,
    maxProjects: 3,
    maxStorage: 2,
    isActive: true,
    isPopular: false,
    priority: 1
  },
  {
    name: "Professional",
    description: "For growing teams that need advanced features",
    monthlyPrice: 29,
    yearlyPrice: 290,
    stripePriceIdMonthly: "price_xxx",
    stripePriceIdYearly: "price_yyy",
    features: [
      "Up to 20 users",
      "Unlimited projects",
      "50GB storage",
      "Advanced features",
      "Priority support"
    ],
    maxUsers: 20,
    maxProjects: -1, // Unlimited
    maxStorage: 50,
    isActive: true,
    isPopular: true,
    priority: 2
  },
  {
    name: "Enterprise",
    description: "For large organizations with advanced needs",
    monthlyPrice: 99,
    yearlyPrice: 990,
    stripePriceIdMonthly: "price_xxx",
    stripePriceIdYearly: "price_yyy",
    features: [
      "Unlimited users",
      "Unlimited projects",
      "500GB storage",
      "All premium features",
      "Dedicated support",
      "Custom integrations"
    ],
    maxUsers: -1, // Unlimited
    maxProjects: -1, // Unlimited
    maxStorage: 500,
    isActive: true,
    isPopular: false,
    priority: 3
  }
]
```

### 4. Testing Configuration

#### Test Stripe Integration

1. Start your development server:
```bash
npm run dev
```

2. Test the subscription endpoints:
```bash
# Get pricing plans
curl -X GET http://localhost:8000/api/pricing

# Create a checkout session
curl -X POST http://localhost:8000/api/subscription/create-checkout-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "workspaceId": "your_workspace_id",
    "planId": "your_plan_id",
    "billingCycle": "monthly",
    "successUrl": "https://your-frontend.com/success",
    "cancelUrl": "https://your-frontend.com/cancel"
  }'
```

#### Test Webhooks Locally

Use the Stripe CLI to test webhooks:

```bash
# Install Stripe CLI
brew install stripe

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:8000/api/stripe/webhook

# Test events
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
```

## 🔧 Configuration Options

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_SECRET_KEY` | ✅ | Your Stripe secret API key |
| `STRIPE_PUBLISHABLE_KEY` | ✅ | Your Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Your webhook signing secret |
| `DEFAULT_TRIAL_DAYS` | ❌ | Default trial period (default: 14) |
| `SUBSCRIPTION_RENEWAL_REMINDER_DAYS` | ❌ | Days before renewal to send reminder |
| `FAILED_PAYMENT_RETRY_DAYS` | ❌ | Days to retry failed payments |

### Stripe Price IDs

Update your subscription plans with the correct Stripe Price IDs:

```javascript
// Example: Update in MongoDB
db.subscriptionplans.updateOne(
  { name: "Professional" },
  {
    $set: {
      stripePriceIdMonthly: "price_1xxx...",
      stripePriceIdYearly: "price_1yyy..."
    }
  }
)
```

## 🚨 Production Checklist

### Before Going Live

- [ ] Use live Stripe API keys (sk_live_*, pk_live_*)
- [ ] Set up production webhook endpoints
- [ ] Configure HTTPS for webhook security
- [ ] Set up monitoring for failed payments
- [ ] Configure email notifications for billing events
- [ ] Test the complete payment flow
- [ ] Set up proper error handling and logging

### Security Considerations

- Never expose your Stripe secret key in frontend code
- Always verify webhook signatures
- Use HTTPS for all API endpoints
- Implement proper rate limiting
- Set up proper CORS configuration

## 📊 Monitoring & Analytics

### Key Metrics to Track

- Monthly Recurring Revenue (MRR)
- Customer Churn Rate
- Conversion Rate (Trial → Paid)
- Average Revenue Per User (ARPU)
- Payment Failure Rate

### Webhook Monitoring

Monitor these webhook events for health:
- `invoice.payment_failed` - Indicates payment issues
- `customer.subscription.deleted` - Indicates churn
- `invoice.payment_action_required` - Requires customer action

## 🔍 Troubleshooting

### Common Issues

1. **Webhook not working**
   - Check if webhook secret is correct
   - Verify webhook URL is accessible
   - Check Stripe event logs

2. **Payment failing**
   - Verify Stripe API keys are correct
   - Check if webhook endpoint is receiving events
   - Review payment method details

3. **Subscription not updating**
   - Check webhook processing logs
   - Verify database connection
   - Review subscription logic

### Debug Mode

Enable debug logging by setting:
```bash
LOG_LEVEL=debug
```

This will provide detailed logs for:
- Stripe API calls
- Webhook processing
- Subscription updates
- Payment processing

## 📞 Support

For issues related to:
- **Stripe Integration**: Check [Stripe Documentation](https://stripe.com/docs)
- **API Issues**: Review server logs and API documentation
- **Database Issues**: Check MongoDB connection and data integrity

## 🔄 Next Steps

After setup, consider implementing:
- Email notifications for billing events
- Automated dunning management
- Usage analytics dashboard
- Customer self-service portal
- Advanced reporting and metrics