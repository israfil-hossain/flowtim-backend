#!/usr/bin/env node

/**
 * Setup script for subscription plans
 * Run this script to initialize default subscription plans in your database
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const SubscriptionPlan = require('../dist/models/subscription-plan.model').default;

const defaultPlans = [
  {
    name: "Starter",
    description: "Perfect for small teams and personal projects",
    monthlyPrice: 0,
    yearlyPrice: 0,
    stripePriceIdMonthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || "",
    stripePriceIdYearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || "",
    features: [
      "Up to 5 users",
      "Up to 3 projects",
      "2GB storage",
      "Basic features",
      "Community support"
    ],
    limitations: [
      "Limited to 5 users",
      "Maximum 3 projects",
      "2GB storage limit"
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
    stripePriceIdMonthly: process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID || "",
    stripePriceIdYearly: process.env.STRIPE_PROFESSIONAL_YEARLY_PRICE_ID || "",
    features: [
      "Up to 20 users",
      "Unlimited projects",
      "50GB storage",
      "Advanced features",
      "Priority support",
      "Team collaboration tools",
      "Advanced analytics"
    ],
    limitations: [
      "Limited to 20 users",
      "50GB storage limit"
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
    stripePriceIdMonthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || "",
    stripePriceIdYearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || "",
    features: [
      "Unlimited users",
      "Unlimited projects",
      "500GB storage",
      "All premium features",
      "Dedicated support",
      "Custom integrations",
      "Advanced security",
      "SLA guarantee",
      "Custom training"
    ],
    limitations: [],
    maxUsers: -1, // Unlimited
    maxProjects: -1, // Unlimited
    maxStorage: 500,
    isActive: true,
    isPopular: false,
    priority: 3
  }
];

async function setupSubscriptionPlans() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flowtim');
    console.log('✅ Connected to database');

    // Clear existing plans (optional - remove if you want to keep existing)
    console.log('🗑️  Clearing existing subscription plans...');
    await SubscriptionPlan.deleteMany({});
    console.log('✅ Existing plans cleared');

    // Insert default plans
    console.log('📦 Creating default subscription plans...');
    const insertedPlans = await SubscriptionPlan.insertMany(defaultPlans);
    console.log(`✅ Successfully created ${insertedPlans.length} subscription plans:`);

    insertedPlans.forEach((plan, index) => {
      console.log(`  ${index + 1}. ${plan.name} - $${plan.monthlyPrice}/month, $${plan.yearlyPrice}/year`);

      if (!plan.stripePriceIdMonthly || !plan.stripePriceIdYearly) {
        console.log(`     ⚠️  Warning: Missing Stripe price IDs for ${plan.name}`);
        console.log(`     Please update in Stripe dashboard and set environment variables:`);
        console.log(`     - STRIPE_${plan.name.toUpperCase()}_MONTHLY_PRICE_ID`);
        console.log(`     - STRIPE_${plan.name.toUpperCase()}_YEARLY_PRICE_ID`);
      }
    });

    console.log('\n🎉 Subscription plans setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Set up your products and prices in Stripe dashboard');
    console.log('2. Add the Stripe price IDs to your environment variables');
    console.log('3. Update the plans in the database with the correct price IDs');
    console.log('4. Test the checkout flow');

    console.log('\n🔧 Update price IDs with this command:');
    console.log('db.subscriptionplans.updateMany({}, {$set: {stripePriceIdMonthly: "price_xxx", stripePriceIdYearly: "price_yyy"}})');

  } catch (error) {
    console.error('❌ Error setting up subscription plans:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the setup
if (require.main === module) {
  setupSubscriptionPlans();
}

module.exports = { setupSubscriptionPlans, defaultPlans };