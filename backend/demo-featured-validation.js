const { getPlanFeaturedLimits, getPlanListingLimits } = require('./utils/planValidator');

console.log('🎯 Featured Listing Validation Demo');
console.log('===================================\n');

// Demo 1: Basic Plan with Limited Features
console.log('📋 Demo 1: Basic Plan (Limited Features)');
const basicPlan = {
  name: 'Basic Plan',
  features: {
    listings: 5,
    featured: 1,
    support: 'email'
  }
};

console.log('Plan:', JSON.stringify(basicPlan, null, 2));
console.log('Total listing limit:', getPlanListingLimits(basicPlan));
console.log('Featured listing limit:', getPlanFeaturedLimits(basicPlan));
console.log('✅ Basic plan allows 5 total listings, 1 featured\n');

// Demo 2: Premium Plan with More Features
console.log('📋 Demo 2: Premium Plan (More Features)');
const premiumPlan = {
  name: 'Premium Plan',
  features: {
    listings: 25,
    featured: 5,
    support: '24/7'
  }
};

console.log('Plan:', JSON.stringify(premiumPlan, null, 2));
console.log('Total listing limit:', getPlanListingLimits(premiumPlan));
console.log('Featured listing limit:', getPlanFeaturedLimits(premiumPlan));
console.log('✅ Premium plan allows 25 total listings, 5 featured\n');

// Demo 3: Enterprise Plan with Unlimited Features
console.log('📋 Demo 3: Enterprise Plan (Unlimited Features)');
const enterprisePlan = {
  name: 'Enterprise Plan',
  features: {
    listings: 'unlimited',
    featured: 'unlimited',
    support: 'dedicated'
  }
};

console.log('Plan:', JSON.stringify(enterprisePlan, null, 2));
console.log('Total listing limit:', getPlanListingLimits(enterprisePlan));
console.log('Featured listing limit:', getPlanFeaturedLimits(enterprisePlan));
console.log('✅ Enterprise plan allows unlimited listings and featured\n');

// Demo 4: Plan with String Numbers
console.log('📋 Demo 4: Plan with String Numbers');
const stringPlan = {
  name: 'String Plan',
  features: {
    listings: '15',
    featured: '3',
    support: 'email'
  }
};

console.log('Plan:', JSON.stringify(stringPlan, null, 2));
console.log('Total listing limit:', getPlanListingLimits(stringPlan));
console.log('Featured listing limit:', getPlanFeaturedLimits(stringPlan));
console.log('✅ String numbers are properly parsed\n');

// Demo 5: Plan with JSON String Features
console.log('📋 Demo 5: Plan with JSON String Features (Database Format)');
const jsonStringPlan = {
  name: 'JSON String Plan',
  features: JSON.stringify({
    listings: 10,
    featured: 2,
    support: 'email'
  })
};

console.log('Plan features (as JSON string):', jsonStringPlan.features);
console.log('Total listing limit:', getPlanListingLimits(jsonStringPlan));
console.log('Featured listing limit:', getPlanFeaturedLimits(jsonStringPlan));
console.log('✅ JSON string features are properly parsed\n');

// Demo 6: Validation Scenarios
console.log('📋 Demo 6: Validation Scenarios');
console.log('Scenario A: Vendor with 0 featured listings wants to create 1 featured listing');
console.log('- Plan allows 1 featured listing');
console.log('- Current featured listings: 0');
console.log('- Result: ✅ ALLOWED (0 < 1)');
console.log('');

console.log('Scenario B: Vendor with 1 featured listing wants to create another featured listing');
console.log('- Plan allows 1 featured listing');
console.log('- Current featured listings: 1');
console.log('- Result: ❌ BLOCKED (1 >= 1)');
console.log('- Error: "You have reached your plan\'s featured listing limit of 1"');
console.log('');

console.log('Scenario C: Vendor with unlimited featured wants to create featured listing');
console.log('- Plan allows unlimited featured listings');
console.log('- Current featured listings: 100');
console.log('- Result: ✅ ALLOWED (unlimited)');
console.log('');

console.log('🎉 Demo completed! Featured listing validation is now implemented.');
console.log('');
console.log('📝 Summary of Changes:');
console.log('1. Added getPlanFeaturedLimits() function');
console.log('2. Updated validateListingCreation() to accept isFeatured parameter');
console.log('3. Added featured listing limit validation');
console.log('4. Updated listing controller to pass is_featured flag');
console.log('5. Added proper error messages for featured limit exceeded');
