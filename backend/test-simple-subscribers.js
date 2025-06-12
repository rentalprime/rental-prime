const supabase = require("./config/supabase");

async function testSimpleSubscribers() {
  console.log("Testing subscribers function...");

  try {
    // Test basic connection
    console.log("1. Testing Supabase connection...");
    const { data: plans, error: planError } = await supabase
      .from("plans")
      .select("id, name, status")
      .limit(5);

    if (planError) {
      console.error("Error fetching plans:", planError);
      return;
    }

    console.log(`✅ Found ${plans.length} plans`);

    // Test subscriptions table
    console.log("2. Testing subscriptions table...");
    const { data: subscriptions, error: subError } = await supabase
      .from("user_subscriptions")
      .select("id, plan_id, is_active")
      .limit(5);

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      return;
    }

    console.log(`✅ Found ${subscriptions.length} subscriptions`);

    // Test the logic from our controller
    console.log("3. Testing subscriber count logic...");
    if (plans.length > 0) {
      const firstPlan = plans[0];

      const { count: activeCount } = await supabase
        .from("user_subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("plan_id", firstPlan.id)
        .eq("is_active", true);

      const { count: totalCount } = await supabase
        .from("user_subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("plan_id", firstPlan.id);

      console.log(
        `✅ Plan "${firstPlan.name}": ${activeCount || 0} active, ${
          totalCount || 0
        } total subscribers`
      );
    }

    console.log("✅ All tests passed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

testSimpleSubscribers();
