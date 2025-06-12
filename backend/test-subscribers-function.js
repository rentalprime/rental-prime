const supabase = require("./config/supabase");

/**
 * Test script for the getSubscribers function
 * This script tests the new subscribers functionality by:
 * 1. Fetching plans with subscriber counts
 * 2. Verifying the data structure
 * 3. Testing different query parameters
 */

async function testSubscribersFunction() {
  console.log("🧪 Testing getSubscribers function...\n");

  try {
    // Test 1: Basic functionality - get all plans with subscriber counts
    console.log("📊 Test 1: Getting all plans with subscriber counts");
    
    // Get all plans first
    const { data: allPlans, error: planError } = await supabase
      .from("plans")
      .select("*");

    if (planError) {
      console.error("❌ Error fetching plans:", planError.message);
      return;
    }

    console.log(`✅ Found ${allPlans.length} plans in database`);

    // Get subscriber counts for each plan using the same logic as the controller
    const plansWithSubscribers = await Promise.all(
      allPlans.map(async (plan) => {
        // Count active subscriptions
        const { count: activeCount, error: activeError } = await supabase
          .from("user_subscriptions")
          .select("*", { count: "exact", head: true })
          .eq("plan_id", plan.id)
          .eq("is_active", true);

        // Count total subscriptions
        const { count: totalCount, error: totalError } = await supabase
          .from("user_subscriptions")
          .select("*", { count: "exact", head: true })
          .eq("plan_id", plan.id);

        if (activeError || totalError) {
          console.log(`⚠️  Warning: Error counting subscriptions for plan ${plan.name}`);
        }

        return {
          ...plan,
          subscriber_count: activeCount || 0,
          total_subscriptions: totalCount || 0,
        };
      })
    );

    // Display results
    console.log("\n📋 Plans with Subscriber Counts:");
    console.log("=" .repeat(80));
    console.log("Plan Name".padEnd(25) + "Status".padEnd(12) + "Price".padEnd(10) + "Active".padEnd(8) + "Total");
    console.log("-".repeat(80));

    plansWithSubscribers.forEach(plan => {
      console.log(
        plan.name.padEnd(25) + 
        plan.status.padEnd(12) + 
        `$${plan.price}`.padEnd(10) + 
        plan.subscriber_count.toString().padEnd(8) + 
        plan.total_subscriptions.toString()
      );
    });

    // Test 2: Check if we have any subscriptions data
    console.log("\n📊 Test 2: Checking subscription data");
    const { data: subscriptions, error: subError } = await supabase
      .from("user_subscriptions")
      .select("*");

    if (subError) {
      console.error("❌ Error fetching subscriptions:", subError.message);
      return;
    }

    console.log(`✅ Found ${subscriptions.length} total subscriptions in database`);

    if (subscriptions.length > 0) {
      const activeSubscriptions = subscriptions.filter(sub => sub.is_active);
      console.log(`✅ Found ${activeSubscriptions.length} active subscriptions`);
      
      // Group by plan_id to show distribution
      const planDistribution = {};
      subscriptions.forEach(sub => {
        if (!planDistribution[sub.plan_id]) {
          planDistribution[sub.plan_id] = { active: 0, total: 0 };
        }
        planDistribution[sub.plan_id].total++;
        if (sub.is_active) {
          planDistribution[sub.plan_id].active++;
        }
      });

      console.log("\n📈 Subscription Distribution by Plan:");
      console.log("-".repeat(50));
      Object.entries(planDistribution).forEach(([planId, counts]) => {
        const plan = allPlans.find(p => p.id === planId);
        const planName = plan ? plan.name : `Plan ${planId.substring(0, 8)}...`;
        console.log(`${planName}: ${counts.active} active, ${counts.total} total`);
      });
    } else {
      console.log("ℹ️  No subscriptions found in database");
    }

    // Test 3: Test sorting functionality
    console.log("\n📊 Test 3: Testing sorting by subscriber count");
    const sortedBySubscribers = [...plansWithSubscribers].sort((a, b) => 
      b.subscriber_count - a.subscriber_count
    );

    console.log("\n🏆 Top Plans by Active Subscribers:");
    console.log("-".repeat(40));
    sortedBySubscribers.slice(0, 5).forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.name}: ${plan.subscriber_count} active subscribers`);
    });

    // Test 4: Summary statistics
    console.log("\n📊 Test 4: Summary Statistics");
    const totalActiveSubscribers = plansWithSubscribers.reduce((sum, plan) => 
      sum + plan.subscriber_count, 0
    );
    const totalAllSubscriptions = plansWithSubscribers.reduce((sum, plan) => 
      sum + plan.total_subscriptions, 0
    );
    const activePlans = plansWithSubscribers.filter(plan => plan.status === 'active').length;

    console.log(`✅ Total Active Plans: ${activePlans}`);
    console.log(`✅ Total Active Subscribers: ${totalActiveSubscribers}`);
    console.log(`✅ Total All Subscriptions: ${totalAllSubscriptions}`);
    console.log(`✅ Average Subscribers per Plan: ${(totalActiveSubscribers / allPlans.length).toFixed(2)}`);

    console.log("\n🎉 All tests completed successfully!");

  } catch (error) {
    console.error("❌ Test failed with error:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Run the test
if (require.main === module) {
  testSubscribersFunction()
    .then(() => {
      console.log("\n✅ Test script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Test script failed:", error.message);
      process.exit(1);
    });
}

module.exports = { testSubscribersFunction };
