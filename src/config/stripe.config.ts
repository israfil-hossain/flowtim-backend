import Stripe from "stripe";
import { config } from "./app.config";

// Initialize Stripe with API key
// Add STRIPE_SECRET_KEY to your .env file
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";

if (!stripeSecretKey) {
  console.warn("⚠️  STRIPE_SECRET_KEY not found in environment variables");
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2025-09-30.clover",
      typescript: true,
    })
  : null;

export const stripeConfig = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  currency: "usd",
  trialPeriodDays: parseInt(process.env.DEFAULT_TRIAL_DAYS || "14"),
  renewalReminderDays: parseInt(process.env.SUBSCRIPTION_RENEWAL_REMINDER_DAYS || "7"),
  failedPaymentRetryDays: parseInt(process.env.FAILED_PAYMENT_RETRY_DAYS || "3"),
};

// Helper function to create Stripe customer
export const createStripeCustomer = async (params: {
  email: string;
  name: string;
  metadata?: Record<string, string>;
}) => {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: params.metadata || {},
  });

  return customer;
};

// Helper function to create checkout session
export const createCheckoutSession = async (params: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) => {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const session = await stripe.checkout.sessions.create({
    customer: params.customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata || {},
  });

  return session;
};

// Helper function to create billing portal session
export const createBillingPortalSession = async (params: {
  customerId: string;
  returnUrl: string;
}) => {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });

  return session;
};

// Helper function to cancel subscription
export const cancelStripeSubscription = async (subscriptionId: string) => {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const subscription = await stripe.subscriptions.cancel(subscriptionId);
  return subscription;
};

// Helper function to update subscription
export const updateStripeSubscription = async (
  subscriptionId: string,
  params: {
    priceId?: string;
    cancelAtPeriodEnd?: boolean;
  }
) => {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const updatedSubscription = await stripe.subscriptions.update(
    subscriptionId,
    {
      items: params.priceId
        ? [
            {
              id: subscription.items.data[0].id,
              price: params.priceId,
            },
          ]
        : undefined,
      cancel_at_period_end: params.cancelAtPeriodEnd,
    }
  );

  return updatedSubscription;
};
