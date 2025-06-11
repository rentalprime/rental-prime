const { getPlanListingLimits } = require("./utils/planValidator");

console.log("Testing simplified getPlanListingLimits function...\n");

// Test 1: Plan with numeric limits
const testPlan1 = {
  features: {
    listings: 10,
    featured: 2
  }
};

// Test 2: Plan with unlimited limits
const testPlan2 = {
  features: {
    listings: "unlimited",
    featured: "unlimited"
  }
};

// Test 3: Plan with string numbers
const testPlan3 = {
  features: {
    listings: "25",
    featured: "5"
  }
};

console.log("Test 1 - Numeric limits:");
console.log("Input:", testPlan1.features);
console.log("Output (available listings):", getPlanListingLimits(testPlan1));

console.log("\nTest 2 - Unlimited limits:");
console.log("Input:", testPlan2.features);
console.log("Output (available listings):", getPlanListingLimits(testPlan2));

console.log("\nTest 3 - String numbers:");
console.log("Input:", testPlan3.features);
console.log("Output (available listings):", getPlanListingLimits(testPlan3));

console.log("\nAll tests completed!");
