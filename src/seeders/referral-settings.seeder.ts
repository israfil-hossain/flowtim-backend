import mongoose from "mongoose";
import { ReferralSettings, Referral, IReferral } from "../models/referral.model";
import dotenv from "dotenv";

dotenv.config();

/**
 * Seeder script to create default referral system settings
 */

const createDefaultReferralSettings = async () => {
  try {
    console.log("🔗 Creating default referral settings...");

    // Check if settings already exist
    const existingSettings = await ReferralSettings.getSettings();
    if (existingSettings) {
      console.log("⚠️  Referral settings already exist. Skipping creation.");
      return existingSettings;
    }

    // Get professional plan for reward
    const SubscriptionPlan = mongoose.model('SubscriptionPlan');
    const professionalPlan = await SubscriptionPlan.findOne({
      name: { $regex: /professional/i }
    });

    if (!professionalPlan) {
      console.log("⚠️  Professional plan not found. Using default plan configuration.");
    }

    // Create default settings
    const settings = new ReferralSettings({
      referralRewardThreshold: 3,
      rewardType: '1_month_premium',
      rewardValue: {
        planId: professionalPlan?._id,
        duration: 1, // 1 month
        credits: 0
      },
      referralLinkExpiryDays: 30,
      allowSelfReferral: false,
      maxReferralsPerUser: 100,
      customReferralCodePrefix: '',
      isActive: true,
      trackingPixels: [],
      customMessages: {
        referralSuccess: '🎉 Congratulations! Your friend has successfully signed up using your referral link.',
        rewardClaimed: '🎁 Reward claimed! Enjoy your 1 month free premium subscription.',
        referralExpired: '⏰ Your referral link has expired. Generate a new one to continue referring friends.'
      },
      updatedBy: null // Will be set when admin updates settings
    });

    await settings.save();

    console.log("✅ Created default referral settings:");
    console.log(`   - Reward threshold: ${settings.referralRewardThreshold} referrals`);
    console.log(`   - Reward type: ${settings.rewardType}`);
    console.log(`   - Reward duration: ${settings.rewardValue.duration} month(s)`);
    console.log(`   - Link expiry: ${settings.referralLinkExpiryDays} days`);
    console.log(`   - Max referrals per user: ${settings.maxReferralsPerUser}`);
    console.log(`   - Self-referral: ${settings.allowSelfReferral ? 'Allowed' : 'Not allowed'}`);

    console.log("🎉 Referral settings seeding completed successfully!");
    return settings;

  } catch (error) {
    console.error("❌ Error creating referral settings:", error);
    throw error;
  }
};

// Create sample discounts for referral rewards
const createReferralDiscounts = async () => {
  try {
    console.log("💰 Creating referral reward discounts...");

    const Discount = mongoose.model('Discount');
    const SubscriptionPlan = mongoose.model('SubscriptionPlan');

    // Get plans for creating discounts
    const professionalPlan = await SubscriptionPlan.findOne({
      name: { $regex: /professional/i }
    });

    if (!professionalPlan) {
      console.log("⚠️  Professional plan not found. Skipping discount creation.");
      return;
    }

    // Check if referral discount already exists
    const existingDiscount = await Discount.findOne({
      appliesTo: 'referral_reward',
      isActive: true
    });

    if (existingDiscount) {
      console.log("⚠️  Referral discount already exists. Skipping creation.");
      return;
    }

    // Create discount for referral reward
    const referralDiscount = new Discount({
      name: 'Referral Reward - 1 Month Free',
      description: '1 month free subscription reward for successful referrals',
      type: 'fixed_amount',
      value: professionalPlan.monthlyPrice || 12,
      appliesTo: 'referral_reward',
      applicablePlans: [professionalPlan._id],
      maxUses: 1000,
      isActive: true,
      metadata: {
        category: 'referral_reward',
        targetAudience: 'users who successfully referred 3+ friends',
        internalNotes: 'Automatically created when users claim referral rewards'
      },
      createdBy: null // System created
    });

    await referralDiscount.save();

    console.log("✅ Created referral reward discount:");
    console.log(`   - Name: ${referralDiscount.name}`);
    console.log(`   - Value: $${referralDiscount.value}`);
    console.log(`   - Applicable plan: ${professionalPlan.name}`);
    console.log(`   - Max uses: ${referralDiscount.maxUses}`);

    console.log("💰 Referral discounts seeding completed successfully!");

  } catch (error) {
    console.error("❌ Error creating referral discounts:", error);
    throw error;
  }
};

// Display current referral statistics
const displayReferralStats = async () => {
  try {
    console.log("\n📊 Referral System Statistics:");

    const Referral = mongoose.model('Referral');
    const User = mongoose.model('User');

    const settings = await ReferralSettings.getSettings();
    if (settings) {
      console.log("Current Settings:");
      console.log(`   - Reward threshold: ${settings.referralRewardThreshold} referrals`);
      console.log(`   - Reward type: ${settings.rewardType}`);
      console.log(`   - System active: ${settings.isActive ? 'Yes' : 'No'}`);
      console.log(`   - Link expiry: ${settings.referralLinkExpiryDays} days`);
      console.log(`   - Max referrals/user: ${settings.maxReferralsPerUser}`);
    }

    // User referral codes
    const usersWithReferralCodes = await User.countDocuments({
      referralCode: { $exists: true, $ne: null }
    });

    const referredUsers = await User.countDocuments({
      referredBy: { $exists: true, $ne: null }
    });

    console.log("\nUser Statistics:");
    console.log(`   - Users with referral codes: ${usersWithReferralCodes}`);
    console.log(`   - Users who were referred: ${referredUsers}`);

    // Referral statistics
    const referralStats = await Referral.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log("\nReferral Status:");
    referralStats.forEach((stat: any) => {
      console.log(`   - ${stat._id}: ${stat.count}`);
    });

    // Check for eligible users who can claim rewards
    if (settings) {
      const eligibleUsers = await User.aggregate([
        {
          $lookup: {
            from: 'referrals',
            localField: '_id',
            foreignField: 'referrerId',
            as: 'referrals'
          }
        },
        {
          $match: {
            'referrals.status': 'completed'
          }
        },
        {
          $addFields: {
            completedReferrals: { $size: '$referrals' }
          }
        },
        {
          $match: {
            completedReferrals: { $gte: settings.referralRewardThreshold }
          }
        },
        {
          $project: {
            name: 1,
            email: 1,
            completedReferrals: 1,
            referralRewardClaimed: 1
          }
        }
      ]);

      const unclaimedRewards = eligibleUsers.filter(
        user => !user.referralRewardClaimed
      );

      console.log(`\nReward Eligibility:`);
      console.log(`   - Users eligible for reward: ${eligibleUsers.length}`);
      console.log(`   - Users with unclaimed rewards: ${unclaimedRewards.length}`);
    }

  } catch (error) {
    console.error("❌ Error displaying referral stats:", error);
  }
};

// Test referral functionality
const testReferralSystem = async () => {
  try {
    console.log("\n🧪 Testing Referral System...");

    const Referral = mongoose.model('Referral');
    const User = mongoose.model('User');

    // Get a test user
    const testUser = await User.findOne({ referralCode: { $exists: true } });
    if (!testUser) {
      console.log("⚠️  No users with referral codes found for testing.");
      return;
    }

    console.log(`Testing with user: ${testUser.name} (${testUser.email})`);
    console.log(`Referral code: ${testUser.referralCode}`);

    // Test referral creation
    const referralCode = await (Referral as any).generateReferralCode('TEST');
    const testReferral = new Referral({
      referrerId: testUser._id,
      referralCode,
      status: 'pending',
      rewardType: '1_month_premium',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      metadata: {
        notes: 'Test referral for system validation'
      }
    });

    await testReferral.save();

    console.log("✅ Test referral created successfully:");
    console.log(`   - Code: ${testReferral.referralCode}`);
    console.log(`   - Status: ${testReferral.status}`);
    console.log(`   - Expires: ${testReferral.expiresAt}`);

    // Test referral lookup
    const foundReferral = await (Referral as any).findByCode(testReferral.referralCode);
    if (foundReferral) {
      console.log("✅ Referral lookup test passed");
    } else {
      console.log("❌ Referral lookup test failed");
    }

    // Clean up test referral
    await Referral.findByIdAndDelete(testReferral._id);
    console.log("🧹 Test referral cleaned up");

    console.log("🧪 Referral system test completed successfully!");

  } catch (error) {
    console.error("❌ Error testing referral system:", error);
  }
};

// Main function
const seedReferralSettings = async () => {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is required in environment variables");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🔗 Connected to MongoDB");

    // Run seeding functions
    await createDefaultReferralSettings();
    await createReferralDiscounts();
    await displayReferralStats();
    await testReferralSystem();

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  seedReferralSettings();
}

export { seedReferralSettings, createDefaultReferralSettings, createReferralDiscounts, displayReferralStats };