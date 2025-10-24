import { Request, Response } from "express";
import { stripe, stripeConfig } from "../config/stripe.config";
import SubscriptionModel from "../models/subscription.model";
import PaymentModel from "../models/payment.model";
import { HTTPSTATUS } from "../config/http.config";
import { updateSubscriptionStatusFromStripeService } from "../services/subscription.service";
import { createPaymentFromWebhookService, updatePaymentFromWebhookService } from "../services/payment.service";
import { NotFoundException } from "../utils/appError";

export const handleStripeWebhook = async (req: Request, res: Response) => {
  if (!stripe) {
    return res.status(HTTPSTATUS.SERVICE_UNAVAILABLE).json({
      error: "Stripe is not configured",
    });
  }

  const sig = req.headers["stripe-signature"];

  if (!sig) {
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      error: "Missing stripe signature",
    });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      stripeConfig.webhookSecret
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      error: `Webhook Error: ${err.message}`,
    });
  }

  console.log(`Received Stripe webhook: ${event.type}`);

  try {
    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;

      case "invoice.payment_action_required":
        await handlePaymentActionRequired(event.data.object);
        break;

      case "invoice.upcoming":
        await handleInvoiceUpcoming(event.data.object);
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object);
        break;

      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;

      case "customer.created":
        await handleCustomerCreated(event.data.object);
        break;

      case "invoice.finalized":
        await handleInvoiceFinalized(event.data.object);
        break;

      case "invoice.marked_uncollectible":
        await handleInvoiceUncollectible(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(HTTPSTATUS.OK).json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      error: "Webhook processing failed",
    });
  }
};

// Handle subscription created
const handleSubscriptionCreated = async (subscription: any) => {
  console.log("Processing subscription.created:", subscription.id);

  const metadata = subscription.metadata;

  if (!metadata.userId || !metadata.workspaceId) {
    console.error("Missing metadata in subscription");
    return;
  }

  await SubscriptionModel.findOneAndUpdate(
    { workspaceId: metadata.workspaceId },
    {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer,
      status: subscription.status === "trialing" ? "trial" : "active",
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    }
  );
};

// Handle subscription updated
const handleSubscriptionUpdated = async (subscription: any) => {
  console.log("Processing subscription.updated:", subscription.id);

  await SubscriptionModel.findOneAndUpdate(
    { stripeSubscriptionId: subscription.id },
    {
      status: subscription.status === "trialing" ? "trial" : subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    }
  );
};

// Handle subscription deleted
const handleSubscriptionDeleted = async (subscription: any) => {
  console.log("Processing subscription.deleted:", subscription.id);

  await SubscriptionModel.findOneAndUpdate(
    { stripeSubscriptionId: subscription.id },
    {
      status: "cancelled",
      cancelledAt: new Date(),
    }
  );
};

// Handle payment succeeded
const handlePaymentSucceeded = async (invoice: any) => {
  console.log("Processing invoice.payment_succeeded:", invoice.id);

  const subscriptionDoc = await SubscriptionModel.findOne({
    stripeSubscriptionId: invoice.subscription,
  });

  if (!subscriptionDoc) {
    console.error("Subscription not found for invoice:", invoice.id);
    return;
  }

  await PaymentModel.create({
    userId: subscriptionDoc.userId,
    subscriptionId: subscriptionDoc._id,
    amount: invoice.amount_paid / 100, // Convert from cents
    currency: invoice.currency.toUpperCase(),
    status: "succeeded",
    paymentMethod: "card",
    stripePaymentIntentId: invoice.payment_intent,
    stripeInvoiceId: invoice.id,
    invoiceUrl: invoice.hosted_invoice_url,
    receiptUrl: invoice.invoice_pdf,
    description: `Payment for ${subscriptionDoc.billingCycle} subscription`,
  });

  // Update subscription status to active if it was in trial
  if (subscriptionDoc.status === "trial") {
    await SubscriptionModel.findByIdAndUpdate(subscriptionDoc._id, {
      status: "active",
    });
  }
};

// Handle payment failed
const handlePaymentFailed = async (invoice: any) => {
  console.log("Processing invoice.payment_failed:", invoice.id);

  const subscriptionDoc = await SubscriptionModel.findOne({
    stripeSubscriptionId: invoice.subscription,
  });

  if (!subscriptionDoc) {
    console.error("Subscription not found for invoice:", invoice.id);
    return;
  }

  await PaymentModel.create({
    userId: subscriptionDoc.userId,
    subscriptionId: subscriptionDoc._id,
    amount: invoice.amount_due / 100,
    currency: invoice.currency.toUpperCase(),
    status: "failed",
    paymentMethod: "card",
    stripeInvoiceId: invoice.id,
    failureReason: invoice.last_finalization_error?.message || "Payment failed",
  });

  // Update subscription status to past_due
  await SubscriptionModel.findByIdAndUpdate(subscriptionDoc._id, {
    status: "past_due",
  });
};

// Handle checkout completed
const handleCheckoutCompleted = async (session: any) => {
  console.log("Processing checkout.session.completed:", session.id);

  const metadata = session.metadata;

  if (!metadata.userId || !metadata.workspaceId) {
    console.error("Missing metadata in checkout session");
    return;
  }

  // The subscription will be created via subscription.created event
  // This is just for logging and additional processing
  console.log(`Checkout completed for user ${metadata.userId}, workspace ${metadata.workspaceId}`);
};

// Handle payment action required
const handlePaymentActionRequired = async (invoice: any) => {
  console.log("Processing invoice.payment_action_required:", invoice.id);

  const subscriptionDoc = await SubscriptionModel.findOne({
    stripeSubscriptionId: invoice.subscription,
  });

  if (!subscriptionDoc) {
    console.error("Subscription not found for invoice:", invoice.id);
    return;
  }

  // Update subscription status to past_due
  await SubscriptionModel.findByIdAndUpdate(subscriptionDoc._id, {
    status: "past_due",
  });

  // Create a failed payment record
  await PaymentModel.create({
    userId: subscriptionDoc.userId,
    subscriptionId: subscriptionDoc._id,
    amount: invoice.amount_due / 100,
    currency: invoice.currency.toUpperCase(),
    status: "failed",
    paymentMethod: "card",
    stripeInvoiceId: invoice.id,
    failureReason: "Payment action required from customer",
  });
};

// Handle upcoming invoice
const handleInvoiceUpcoming = async (invoice: any) => {
  console.log("Processing invoice.upcoming:", invoice.id);

  const subscriptionDoc = await SubscriptionModel.findOne({
    stripeSubscriptionId: invoice.subscription,
  });

  if (!subscriptionDoc) {
    console.error("Subscription not found for upcoming invoice:", invoice.id);
    return;
  }

  // Log upcoming invoice for notification purposes
  console.log(`Upcoming invoice for subscription ${subscriptionDoc._id}, amount: ${invoice.amount_due / 100} ${invoice.currency.toUpperCase()}`);

  // Here you could send email notifications to users about upcoming payments
};

// Handle payment intent succeeded
const handlePaymentIntentSucceeded = async (paymentIntent: any) => {
  console.log("Processing payment_intent.succeeded:", paymentIntent.id);

  // Find payment by Stripe payment intent ID and update
  await updatePaymentFromWebhookService(paymentIntent.id, {
    status: "succeeded",
    receiptUrl: paymentIntent.charges?.data[0]?.receipt_url,
  });
};

// Handle payment intent failed
const handlePaymentIntentFailed = async (paymentIntent: any) => {
  console.log("Processing payment_intent.payment_failed:", paymentIntent.id);

  // Find payment by Stripe payment intent ID and update
  await updatePaymentFromWebhookService(paymentIntent.id, {
    status: "failed",
    failureReason: paymentIntent.last_payment_error?.message || "Payment failed",
  });
};

// Handle customer created
const handleCustomerCreated = async (customer: any) => {
  console.log("Processing customer.created:", customer.id);

  // This is useful for tracking new customers in your system
  // You might want to link this to your user management
  console.log(`New Stripe customer created: ${customer.id}, email: ${customer.email}`);
};

// Handle invoice finalized
const handleInvoiceFinalized = async (invoice: any) => {
  console.log("Processing invoice.finalized:", invoice.id);

  // Invoice is finalized and ready for payment
  // This is a good place to send notifications about upcoming charges
  console.log(`Invoice finalized: ${invoice.id}, amount: ${invoice.amount_due / 100} ${invoice.currency.toUpperCase()}`);
};

// Handle invoice uncollectible
const handleInvoiceUncollectible = async (invoice: any) => {
  console.log("Processing invoice.marked_uncollectible:", invoice.id);

  const subscriptionDoc = await SubscriptionModel.findOne({
    stripeSubscriptionId: invoice.subscription,
  });

  if (!subscriptionDoc) {
    console.error("Subscription not found for uncollectible invoice:", invoice.id);
    return;
  }

  // Update subscription status to reflect payment issues
  await SubscriptionModel.findByIdAndUpdate(subscriptionDoc._id, {
    status: "past_due",
  });

  // Create or update payment record
  await PaymentModel.create({
    userId: subscriptionDoc.userId,
    subscriptionId: subscriptionDoc._id,
    amount: invoice.amount_due / 100,
    currency: invoice.currency.toUpperCase(),
    status: "failed",
    paymentMethod: "card",
    stripeInvoiceId: invoice.id,
    failureReason: "Invoice marked as uncollectible",
  });
};
