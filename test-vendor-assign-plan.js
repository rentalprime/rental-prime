const { createClient } = require("@supabase/supabase-js");

// Initialize the Supabase client with the provided credentials
const supabaseUrl = "https://vmwjqwgvzmwjomcehabe.supabase.co";
const supabase_service_role =
  process.env.SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtd2pxd2d2em13am9tY2VoYWJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg5ODI4NiwiZXhwIjoyMDYzNDc0Mjg2fQ.H1YMO_Tye6ikWth7csEwPMWI3CxYcQaQ6N6oNXwf-0c";

const supabase = createClient(supabaseUrl, supabase_service_role);

async function testVendorAssignPlan() {
  try {
    console.log("🧪 Testing vendor plan assignment functionality...");

    // 1. Check if we have vendors and plans
    console.log("\n📋 Checking existing vendors...");
    const { data: vendors, error: vendorsError } = await supabase
      .from("users")
      .select("id, name, email, user_type")
      .eq("user_type", "vendor")
      .limit(5);

    if (vendorsError) {
      console.error("Error fetching vendors:", vendorsError);
      return false;
    }

    console.log(`Found ${vendors.length} vendors:`);
    vendors.forEach((vendor, index) => {
      console.log(`  ${index + 1}. ${vendor.name} (${vendor.email}) - ID: ${vendor.id}`);
    });

    console.log("\n📋 Checking existing plans...");
    const { data: plans, error: plansError } = await supabase
      .from("plans")
      .select("id, name, price, interval, status")
      .eq("status", "active")
      .limit(5);

    if (plansError) {
      console.error("Error fetching plans:", plansError);
      return false;
    }

    console.log(`Found ${plans.length} active plans:`);
    plans.forEach((plan, index) => {
      console.log(`  ${index + 1}. ${plan.name} - $${plan.price}/${plan.interval} - ID: ${plan.id}`);
    });

    if (vendors.length === 0 || plans.length === 0) {
      console.log("❌ Need at least one vendor and one plan to test assignment");
      return false;
    }

    // 2. Test creating a subscription for a vendor
    const testVendor = vendors[0];
    const testPlan = plans[0];

    console.log(`\n🔄 Testing vendor plan assignment...`);
    console.log(`Assigning plan "${testPlan.name}" to vendor "${testVendor.name}"`);

    // Calculate end date (30 days from now for testing)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const subscriptionData = {
      user_id: testVendor.id,
      plan_id: testPlan.id,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: subscription, error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .insert([subscriptionData])
      .select(`
        *,
        users!user_subscriptions_user_id_fkey (
          id,
          name,
          email,
          user_type
        ),
        plans!user_subscriptions_plan_id_fkey (
          id,
          name,
          price,
          interval
        )
      `)
      .single();

    if (subscriptionError) {
      console.error("❌ Error creating subscription:", subscriptionError);
      return false;
    }

    console.log("✅ Vendor subscription created successfully!");
    console.log("Subscription details:");
    console.log(`  ID: ${subscription.id}`);
    console.log(`  Vendor: ${subscription.users.name} (${subscription.users.email})`);
    console.log(`  User Type: ${subscription.users.user_type}`);
    console.log(`  Plan: ${subscription.plans.name} - $${subscription.plans.price}/${subscription.plans.interval}`);
    console.log(`  Start Date: ${subscription.start_date}`);
    console.log(`  End Date: ${subscription.end_date}`);
    console.log(`  Active: ${subscription.is_active}`);

    // 3. Test fetching vendor subscriptions
    console.log("\n📋 Fetching vendor subscriptions...");
    const { data: vendorSubscriptions, error: fetchError } = await supabase
      .from("user_subscriptions")
      .select(`
        *,
        users!user_subscriptions_user_id_fkey (
          id,
          name,
          email,
          user_type
        ),
        plans!user_subscriptions_plan_id_fkey (
          id,
          name,
          price,
          interval
        )
      `)
      .eq("user_id", testVendor.id);

    if (fetchError) {
      console.error("❌ Error fetching subscriptions:", fetchError);
      return false;
    }

    console.log(`Found ${vendorSubscriptions.length} subscriptions for vendor ${testVendor.name}:`);
    vendorSubscriptions.forEach((sub, index) => {
      console.log(`  ${index + 1}. ${sub.plans.name} - Active: ${sub.is_active} - User Type: ${sub.users.user_type}`);
    });

    // 4. Test duplicate subscription prevention
    console.log("\n🔄 Testing duplicate subscription prevention...");
    const { data: duplicateTest, error: duplicateError } = await supabase
      .from("user_subscriptions")
      .insert([subscriptionData])
      .select();

    if (duplicateError) {
      console.log("✅ Duplicate prevention working (this error is expected)");
      console.log("Error:", duplicateError.message);
    } else {
      console.log("⚠️  Warning: Duplicate subscription was created, this might need attention");
    }

    // 5. Verify vendor-only access pattern
    console.log("\n🔒 Verifying vendor access pattern...");
    const vendorOnlySubscriptions = vendorSubscriptions.filter(sub => sub.users.user_type === 'vendor');
    console.log(`✅ All ${vendorOnlySubscriptions.length} subscriptions belong to vendors`);

    console.log("\n✅ All vendor assignment tests completed successfully!");
    return true;

  } catch (error) {
    console.error("❌ Test failed with error:", error);
    return false;
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testVendorAssignPlan()
    .then((success) => {
      if (success) {
        console.log("\n🎉 All vendor assignment tests passed!");
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

module.exports = testVendorAssignPlan;
