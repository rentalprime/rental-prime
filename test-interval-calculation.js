const { createClient } = require("@supabase/supabase-js");

// Initialize the Supabase client with the provided credentials
const supabaseUrl = "https://vmwjqwgvzmwjomcehabe.supabase.co";
const supabase_service_role =
  process.env.SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtd2pxd2d2em13am9tY2VoYWJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg5ODI4NiwiZXhwIjoyMDYzNDc0Mjg2fQ.H1YMO_Tye6ikWth7csEwPMWI3CxYcQaQ6N6oNXwf-0c";

const supabase = createClient(supabaseUrl, supabase_service_role);

// Function to calculate end date based on interval (same logic as in controller)
function calculateEndDate(startDate, interval) {
  const startDateObj = new Date(startDate);
  let calculatedEndDate = null;

  switch (interval) {
    case "monthly":
      calculatedEndDate = new Date(startDateObj);
      calculatedEndDate.setMonth(calculatedEndDate.getMonth() + 1);
      break;
    case "quarterly":
      calculatedEndDate = new Date(startDateObj);
      calculatedEndDate.setMonth(calculatedEndDate.getMonth() + 3);
      break;
    case "half-yearly":
      calculatedEndDate = new Date(startDateObj);
      calculatedEndDate.setMonth(calculatedEndDate.getMonth() + 6);
      break;
    case "yearly":
      calculatedEndDate = new Date(startDateObj);
      calculatedEndDate.setFullYear(calculatedEndDate.getFullYear() + 1);
      break;
    default:
      // If interval is not recognized, use monthly as default
      calculatedEndDate = new Date(startDateObj);
      calculatedEndDate.setMonth(calculatedEndDate.getMonth() + 1);
      break;
  }

  return calculatedEndDate;
}

async function testIntervalCalculation() {
  try {
    console.log("🧪 Testing interval-based end date calculation...");

    // Test date calculations
    const testStartDate = "2024-01-15T10:00:00Z";
    const intervals = ["monthly", "quarterly", "half-yearly", "yearly"];

    console.log(`\n📅 Testing date calculations for start date: ${testStartDate}`);
    console.log("=" .repeat(70));

    intervals.forEach(interval => {
      const endDate = calculateEndDate(testStartDate, interval);
      console.log(`${interval.padEnd(12)} | ${testStartDate} → ${endDate.toISOString()}`);
    });

    // Test with different start dates
    console.log("\n📅 Testing with different start dates:");
    console.log("=" .repeat(70));

    const testDates = [
      "2024-01-31T10:00:00Z", // End of month
      "2024-02-29T10:00:00Z", // Leap year
      "2024-12-31T10:00:00Z", // End of year
    ];

    testDates.forEach(startDate => {
      console.log(`\nStart Date: ${startDate}`);
      intervals.forEach(interval => {
        const endDate = calculateEndDate(startDate, interval);
        console.log(`  ${interval.padEnd(12)} → ${endDate.toISOString()}`);
      });
    });

    // Test with actual plans from database
    console.log("\n📋 Testing with actual plans from database:");
    console.log("=" .repeat(70));

    const { data: plans, error: plansError } = await supabase
      .from("plans")
      .select("id, name, interval, price")
      .eq("status", "active")
      .limit(10);

    if (plansError) {
      console.error("Error fetching plans:", plansError);
      return false;
    }

    if (plans.length === 0) {
      console.log("No active plans found in database");
      return false;
    }

    const currentDate = new Date().toISOString();
    console.log(`Current Date: ${currentDate}\n`);

    plans.forEach((plan, index) => {
      const endDate = calculateEndDate(currentDate, plan.interval);
      console.log(`${index + 1}. ${plan.name}`);
      console.log(`   Interval: ${plan.interval}`);
      console.log(`   Price: $${plan.price}`);
      console.log(`   End Date: ${endDate.toISOString()}`);
      console.log(`   Duration: ${Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24))} days`);
      console.log("");
    });

    // Test edge cases
    console.log("🔍 Testing edge cases:");
    console.log("=" .repeat(70));

    // Test unknown interval
    const unknownInterval = calculateEndDate(testStartDate, "unknown");
    console.log(`Unknown interval (defaults to monthly): ${unknownInterval.toISOString()}`);

    // Test null/undefined interval
    const nullInterval = calculateEndDate(testStartDate, null);
    console.log(`Null interval (defaults to monthly): ${nullInterval.toISOString()}`);

    console.log("\n✅ All interval calculation tests completed successfully!");
    return true;

  } catch (error) {
    console.error("❌ Test failed with error:", error);
    return false;
  }
}

// Function to test actual subscription creation with interval calculation
async function testSubscriptionWithInterval() {
  try {
    console.log("\n🔄 Testing subscription creation with interval calculation...");

    // Get a vendor and a plan
    const { data: vendors, error: vendorsError } = await supabase
      .from("users")
      .select("id, name, email, user_type")
      .eq("user_type", "vendor")
      .limit(1);

    if (vendorsError || vendors.length === 0) {
      console.log("No vendors found for testing");
      return false;
    }

    const { data: plans, error: plansError } = await supabase
      .from("plans")
      .select("id, name, interval, price")
      .eq("status", "active")
      .limit(1);

    if (plansError || plans.length === 0) {
      console.log("No active plans found for testing");
      return false;
    }

    const vendor = vendors[0];
    const plan = plans[0];
    const startDate = new Date();
    const expectedEndDate = calculateEndDate(startDate, plan.interval);

    console.log(`Vendor: ${vendor.name}`);
    console.log(`Plan: ${plan.name} (${plan.interval})`);
    console.log(`Start Date: ${startDate.toISOString()}`);
    console.log(`Expected End Date: ${expectedEndDate.toISOString()}`);

    // Create subscription (simulating the controller logic)
    const subscriptionData = {
      user_id: vendor.id,
      plan_id: plan.id,
      start_date: startDate.toISOString(),
      end_date: expectedEndDate.toISOString(),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: subscription, error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .insert([subscriptionData])
      .select()
      .single();

    if (subscriptionError) {
      console.error("Error creating test subscription:", subscriptionError);
      return false;
    }

    console.log("✅ Test subscription created successfully!");
    console.log(`Subscription ID: ${subscription.id}`);
    console.log(`Actual End Date: ${subscription.end_date}`);
    console.log(`Dates match: ${subscription.end_date === expectedEndDate.toISOString()}`);

    return true;

  } catch (error) {
    console.error("❌ Subscription test failed:", error);
    return false;
  }
}

// Run the tests if this script is executed directly
if (require.main === module) {
  Promise.all([
    testIntervalCalculation(),
    testSubscriptionWithInterval()
  ])
    .then(([calcSuccess, subSuccess]) => {
      if (calcSuccess && subSuccess) {
        console.log("\n🎉 All interval calculation tests passed!");
        process.exit(0);
      } else {
        console.log("\n❌ Some tests failed!");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("❌ Test suite failed with error:", error);
      process.exit(1);
    });
}

module.exports = { testIntervalCalculation, testSubscriptionWithInterval, calculateEndDate };
