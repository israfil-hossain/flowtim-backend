import SubscriptionPlanModel from "../models/subscription-plan.model";
import connectDatabase from "../config/database.config";
import { config } from "../config/app.config";

const pricingPlans = [
  {
    name: "Starter",
    description: "Perfect for small teams getting started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "Up to 5 team members",
      "3 projects",
      "Basic task management",
      "Email support",
      "Mobile app access",
      "Basic reporting",
      "2GB storage",
    ],
    limitations: ["Limited integrations", "Basic analytics only"],
    maxUsers: 5,
    maxProjects: 3,
    maxStorage: 2, // 2GB
    isActive: true,
    isPopular: false,
    priority: 1,
  },
  {
    name: "Professional",
    description: "For growing teams that need more power",
    monthlyPrice: 12,
    yearlyPrice: 120,
    features: [
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
      "API access",
    ],
    limitations: [],
    maxUsers: 25,
    maxProjects: 999999, // Unlimited
    maxStorage: 50, // 50GB
    isActive: true,
    isPopular: true,
    priority: 2,
  },
  {
    name: "Enterprise",
    description: "For large organizations with complex needs",
    monthlyPrice: 24,
    yearlyPrice: 240,
    features: [
      "Unlimited team members",
      "Unlimited projects",
      "Enterprise task management",
      "24/7 phone & email support",
      "White-label options",
      "Custom reporting",
      "Unlimited storage",
      "Advanced time tracking",
      "Custom integrations",
      "Advanced security",
      "Dedicated account manager",
      "Custom onboarding",
      "SSO integration",
      "Advanced permissions",
    ],
    limitations: [],
    maxUsers: 999999, // Unlimited
    maxProjects: 999999, // Unlimited
    maxStorage: 999999, // Unlimited
    isActive: true,
    isPopular: false,
    priority: 3,
  },
];

const seedPricingPlans = async () => {
  try {
    console.log("🌱 Starting pricing plans seeder...");

    // Connect to database
    await connectDatabase();
    console.log("✅ Connected to database");

    // Clear existing pricing plans
    await SubscriptionPlanModel.deleteMany({});
    console.log("🗑️  Cleared existing pricing plans");

    // Insert new pricing plans
    const createdPlans = await SubscriptionPlanModel.insertMany(pricingPlans);
    console.log(`✅ Created ${createdPlans.length} pricing plans:`);

    createdPlans.forEach((plan) => {
      console.log(`   - ${plan.name}: $${plan.monthlyPrice}/month, $${plan.yearlyPrice}/year`);
    });

    console.log("\n🎉 Pricing plans seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding pricing plans:", error);
    process.exit(1);
  }
};

// Run seeder if this file is executed directly
if (require.main === module) {
  seedPricingPlans();
}

export default seedPricingPlans;
