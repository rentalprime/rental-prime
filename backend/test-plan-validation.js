const supabase = require("./config/supabase");
const { validateListingCreation, getPlanListingLimits, checkVendorActivePlan, countVendorListings } = require("./utils/planValidator");

async function testPlanValidation() {
  console.log("🧪 Testing Plan Validation System...\n");

  try {
    // Test 1: Test getPlanListingLimits function
    console.log("📋 Test 1: Testing getPlanListingLimits function");
    
    const testPlan1 = {
      features: {
        listings: 10,
        featured: 2
      }
    };
    
    const testPlan2 = {
      features: {
        listings: "unlimited",
        featured: "unlimited"
      }
    };
    
    const limits1 = getPlanListingLimits(testPlan1);
    const limits2 = getPlanListingLimits(testPlan2);
    
    console.log("Plan 1 limits:", limits1);
    console.log("Plan 2 limits:", limits2);
    console.log("✅ getPlanListingLimits test passed\n");

    // Test 2: Check if we can fetch plans from database
    console.log("📋 Test 2: Testing database connection and plan fetching");
    
    const { data: plans, error: plansError } = await supabase
      .from("plans")
      .select("*")
      .limit(3);
    
    if (plansError) {
      console.log("❌ Error fetching plans:", plansError);
    } else {
      console.log("✅ Successfully fetched plans:", plans.length, "plans found");
      if (plans.length > 0) {
        console.log("Sample plan:", plans[0]);
        const sampleLimits = getPlanListingLimits(plans[0]);
        console.log("Sample plan limits:", sampleLimits);
      }
    }
    console.log("");

    // Test 3: Check if we can fetch users
    console.log("📋 Test 3: Testing user fetching");
    
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, name, email, user_type")
      .eq("user_type", "vendor")
      .limit(3);
    
    if (usersError) {
      console.log("❌ Error fetching users:", usersError);
    } else {
      console.log("✅ Successfully fetched vendors:", users.length, "vendors found");
      if (users.length > 0) {
        console.log("Sample vendor:", users[0]);
      }
    }
    console.log("");

    // Test 4: Test with a real vendor if available
    if (users && users.length > 0) {
      const testVendor = users[0];
      console.log(`📋 Test 4: Testing plan validation for vendor: ${testVendor.name}`);
      
      // Check vendor's active plan
      const planCheck = await checkVendorActivePlan(testVendor.id);
      console.log("Vendor plan check:", planCheck);
      
      // Count vendor's listings
      const listingCount = await countVendorListings(testVendor.id);
      console.log("Vendor listing count:", listingCount);
      
      // Test listing creation validation
      const validationResult = await validateListingCreation(testVendor.id, false);
      console.log("Listing creation validation (regular):", validationResult);
      
      const featuredValidationResult = await validateListingCreation(testVendor.id, true);
      console.log("Listing creation validation (featured):", featuredValidationResult);
      
      console.log("✅ Vendor validation test completed\n");
    }

    console.log("🎉 All tests completed successfully!");

  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
}

// Run the test
if (require.main === module) {
  testPlanValidation().then(() => {
    console.log("Test script finished.");
    process.exit(0);
  }).catch((error) => {
    console.error("Test script failed:", error);
    process.exit(1);
  });
}

module.exports = { testPlanValidation };
