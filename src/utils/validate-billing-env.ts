/**
 * Environment validation for subscription and billing system
 */

export const validateBillingEnvironment = () => {
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ];

  const optionalVars = [
    'DEFAULT_TRIAL_DAYS',
    'SUBSCRIPTION_RENEWAL_REMINDER_DAYS',
    'FAILED_PAYMENT_RETRY_DAYS'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables for billing:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n📖 Please check your .env file and SUBSCRIPTION_BILLING_SETUP.md');
    return false;
  }

  // Check if Stripe keys look valid
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
  const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY || '';

  if (!stripeSecretKey.startsWith('sk_')) {
    console.warn('⚠️  STRIPE_SECRET_KEY should start with "sk_"');
  }

  if (!stripePublishableKey.startsWith('pk_')) {
    console.warn('⚠️  STRIPE_PUBLISHABLE_KEY should start with "pk_"');
  }

  // Check if using test keys (good for development)
  const isTestMode = stripeSecretKey.includes('_test_') || stripePublishableKey.includes('_test_');
  if (isTestMode) {
    console.log('✅ Using Stripe test keys');
  } else {
    console.log('🚀 Using Stripe live keys - Production mode detected');
  }

  // Validate optional vars with defaults
  const trialDays = parseInt(process.env.DEFAULT_TRIAL_DAYS || '14');
  const reminderDays = parseInt(process.env.SUBSCRIPTION_RENEWAL_REMINDER_DAYS || '7');
  const retryDays = parseInt(process.env.FAILED_PAYMENT_RETRY_DAYS || '3');

  if (isNaN(trialDays) || trialDays < 0) {
    console.warn('⚠️  Invalid DEFAULT_TRIAL_DAYS, using default (14)');
  }

  if (isNaN(reminderDays) || reminderDays < 0) {
    console.warn('⚠️  Invalid SUBSCRIPTION_RENEWAL_REMINDER_DAYS, using default (7)');
  }

  if (isNaN(retryDays) || retryDays < 0) {
    console.warn('⚠️  Invalid FAILED_PAYMENT_RETRY_DAYS, using default (3)');
  }

  console.log('✅ Billing environment validation completed');
  return true;
};

export const getBillingConfig = () => {
  return {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      isTestMode: (process.env.STRIPE_SECRET_KEY || '').includes('_test_')
    },
    subscription: {
      trialDays: parseInt(process.env.DEFAULT_TRIAL_DAYS || '14'),
      renewalReminderDays: parseInt(process.env.SUBSCRIPTION_RENEWAL_REMINDER_DAYS || '7'),
      failedPaymentRetryDays: parseInt(process.env.FAILED_PAYMENT_RETRY_DAYS || '3')
    }
  };
};