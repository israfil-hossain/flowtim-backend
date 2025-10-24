# Environment Variables Setup Guide

This guide covers all the environment variables needed to run the Flowtim application with the complete pricing/subscription system.

## Backend Environment Variables (.env)

Create a `.env` file in the root of the `flowtim-backend` directory:

### Required Variables

```env
# Server Configuration
NODE_ENV=development
PORT=8000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/flowtim

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Stripe Configuration (Required for Payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### Optional Variables

```env
# Redis Configuration (for caching)
REDIS_URL=redis://localhost:6379

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=info
```

## Frontend Environment Variables (.env)

Create a `.env` file in the root of the `flowtim-frontend` directory:

### Required Variables

```env
# API Configuration
VITE_API_URL=http://localhost:8000

# Stripe Configuration (Public Key Only)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### Optional Variables

```env
# App Configuration
VITE_APP_NAME=Flowtim
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_BILLING=true
VITE_ENABLE_INTEGRATIONS=true
```

## Stripe Setup Guide

### 1. Create a Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Sign up or log in to your account
3. Complete the onboarding process

### 2. Get API Keys

1. In Stripe Dashboard, go to **Developers** → **API keys**
2. You'll see two keys:
   - **Publishable key** (starts with `pk_`) - Used in frontend
   - **Secret key** (starts with `sk_`) - Used in backend

3. For development, use test keys (they start with `pk_test_` and `sk_test_`)
4. For production, you'll need to activate your account and use live keys

### 3. Create Webhook Endpoint

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL: `https://your-domain.com/api/stripe/webhook`
4. For local development, use the Stripe CLI:
   ```bash
   # Install Stripe CLI
   npm install -g stripe-cli

   # Login to Stripe
   stripe login

   # Forward webhooks to your local server
   stripe listen --forward-to localhost:8000/api/stripe/webhook
   ```
5. Select these events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`

6. Copy the webhook secret key (starts with `whsec_`)

### 4. Create Products and Prices

1. In Stripe Dashboard, go to **Products**
2. Create products for each pricing plan:

#### Starter Plan (Free)
- **Name:** Starter Plan
- **Description:** Perfect for small teams getting started
- **Price:** $0/month

#### Professional Plan
- **Name:** Professional Plan
- **Description:** For growing teams that need more power
- **Price 1 (Monthly):** $12/month (recurring)
- **Price 2 (Yearly):** $120/year (recurring)

#### Enterprise Plan
- **Name:** Enterprise Plan
- **Description:** For large organizations with complex needs
- **Price 1 (Monthly):** $24/month (recurring)
- **Price 2 (Yearly):** $240/year (recurring)

### 5. Copy Price IDs

After creating products and prices, copy the Price IDs (they start with `price_`) and update your database:

```bash
# Update pricing plans with Stripe Price IDs
ts-node src/seeders/pricing-plans.seeder.ts
```

## Testing Configuration

### Backend Setup

1. Install dependencies:
   ```bash
   cd flowtim-backend
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. Seed the database with pricing plans:
   ```bash
   npm run seed:pricing
   # or
   ts-node src/seeders/pricing-plans.seeder.ts
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd flowtim-frontend
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Testing Stripe Integration

1. Test API endpoints:
   ```bash
   # Get pricing plans
   curl http://localhost:8000/api/pricing/plans

   # Test webhook (with Stripe CLI running)
   stripe trigger customer.subscription.created
   ```

2. Test in browser:
   - Navigate to pricing page
   - Try creating subscriptions
   - Use Stripe test cards for payments

## Production Deployment

### Required Changes for Production

1. **Use Live Stripe Keys:**
   - Replace test keys with live keys
   - Update both frontend and backend environment variables

2. **Secure Webhook Endpoint:**
   - Use HTTPS URL for webhook endpoint
   - Ensure webhook secret is set and secure

3. **Database Security:**
   - Use production MongoDB connection string
   - Enable authentication and SSL

4. **Environment Security:**
   - Never commit `.env` files to version control
   - Use secure environment variable management in production
   - Rotate keys periodically

### Environment Variable Management

Use one of these approaches for production:

1. **Platform Environment Variables** (Recommended):
   - Vercel, Heroku, AWS, etc. provide secure environment variable management
   - Set variables through platform dashboard or CLI

2. **Docker Secrets**:
   ```dockerfile
   # Use Docker secrets in production
   RUN --mount=type=secret,id=stripe_key \
     echo "STRIPE_SECRET_KEY=$(cat /run/secrets/stripe_key)" >> .env
   ```

3. **Kubernetes Secrets**:
   ```yaml
   apiVersion: v1
   kind: Secret
   metadata:
     name: stripe-secrets
   type: Opaque
   data:
     STRIPE_SECRET_KEY: <base64-encoded-key>
   ```

## Troubleshooting

### Common Issues

1. **"Stripe is not configured" error:**
   - Check that `STRIPE_SECRET_KEY` is set in backend `.env`
   - Verify the key is valid and active

2. **Webhook verification failed:**
   - Ensure `STRIPE_WEBHOOK_SECRET` is set correctly
   - Check that webhook endpoint is accessible
   - Verify you're using the correct webhook secret

3. **Payment failed:**
   - Check Stripe Dashboard for payment details
   - Verify webhook events are being received
   - Check server logs for errors

4. **CORS issues:**
   - Ensure `FRONTEND_URL` is set correctly in backend
   - Check that frontend is making requests to correct URL

### Debug Mode

Enable debug logging by setting:
```env
LOG_LEVEL=debug
```

### Testing with CLI

Use Stripe CLI for local testing:
```bash
# Trigger test events
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed

# Listen for webhooks
stripe listen --forward-to localhost:8000/api/stripe/webhook
```

## Security Checklist

- [ ] Never commit `.env` files to version control
- [ ] Use HTTPS in production
- [ ] Implement proper CORS configuration
- [ ] Validate webhook signatures
- [ ] Use secure key management
- [ ] Regularly rotate API keys
- [ ] Monitor Stripe Dashboard for suspicious activity
- [ ] Implement proper error handling and logging
- [ ] Use Stripe's radar for fraud detection
- [ ] Keep Stripe SDKs updated

## Support

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe Support:** https://support.stripe.com
- **API Reference:** https://stripe.com/docs/api
- **Webhooks Guide:** https://stripe.com/docs/webhooks