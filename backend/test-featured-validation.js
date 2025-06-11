const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:5000/api';

// Test data
const testListing = {
  title: 'Test Featured Listing',
  description: 'This is a test featured listing to validate plan limits',
  price: 1000,
  category_id: '11111111-1111-1111-1111-111111111111', // Electronics category
  location: 'Mumbai, Maharashtra',
  is_featured: true, // This is the key - making it featured
  brand: 'Test Brand',
  condition: 'Like New',
  price_period: 'day',
  deposit: 500,
  min_duration: 1,
  delivery: false,
  shipping: 0,
  accept_deposit: true,
  cancellation: 'flexible'
};

const testRegularListing = {
  ...testListing,
  title: 'Test Regular Listing',
  is_featured: false // Regular listing
};

// Function to test featured listing creation
async function testFeaturedListingValidation() {
  try {
    console.log('🧪 Testing Featured Listing Validation...\n');

    // Test 1: Try to create a regular listing (should work if vendor has active plan)
    console.log('📋 Test 1: Creating regular listing...');
    try {
      const regularResponse = await axios.post(`${API_URL}/listings`, testRegularListing, {
        headers: {
          'Content-Type': 'application/json',
          // Note: In real scenario, you'd need proper authentication headers
        }
      });
      console.log('✅ Regular listing created successfully');
      console.log('Response:', regularResponse.data);
    } catch (error) {
      console.log('❌ Regular listing creation failed:');
      console.log('Status:', error.response?.status);
      console.log('Message:', error.response?.data?.message);
      
      if (error.response?.data?.message?.includes('plan')) {
        console.log('💡 This is expected if vendor has no active plan or reached limits');
      }
    }

    console.log('\n');

    // Test 2: Try to create a featured listing
    console.log('📋 Test 2: Creating featured listing...');
    try {
      const featuredResponse = await axios.post(`${API_URL}/listings`, testListing, {
        headers: {
          'Content-Type': 'application/json',
          // Note: In real scenario, you'd need proper authentication headers
        }
      });
      console.log('✅ Featured listing created successfully');
      console.log('Response:', featuredResponse.data);
    } catch (error) {
      console.log('❌ Featured listing creation failed:');
      console.log('Status:', error.response?.status);
      console.log('Message:', error.response?.data?.message);
      
      if (error.response?.data?.message?.includes('featured listing limit')) {
        console.log('✅ Featured listing validation is working correctly!');
      } else if (error.response?.data?.message?.includes('plan')) {
        console.log('💡 This is expected if vendor has no active plan');
      }
    }

    console.log('\n🎉 Featured listing validation test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Function to display validation logic explanation
function explainValidation() {
  console.log('📚 Featured Listing Validation Logic:');
  console.log('=====================================');
  console.log('1. When creating a listing with is_featured: true');
  console.log('2. The system checks if vendor has an active plan');
  console.log('3. It validates total listing limits (features.listings)');
  console.log('4. It validates featured listing limits (features.featured)');
  console.log('5. If featured limit is reached, creation is blocked');
  console.log('6. Error message: "You have reached your plan\'s featured listing limit of X"');
  console.log('');
  console.log('Plan Structure Example:');
  console.log(JSON.stringify({
    features: {
      listings: 10,      // Total listings allowed
      featured: 2,       // Featured listings allowed
      support: "email"
    }
  }, null, 2));
  console.log('');
}

// Run the test
if (require.main === module) {
  explainValidation();
  testFeaturedListingValidation().then(() => {
    console.log('Test script finished.');
  }).catch((error) => {
    console.error('Test script failed:', error);
  });
}

module.exports = { testFeaturedListingValidation };
