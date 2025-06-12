const fetch = require('node-fetch');

const API_BASE_URL = 'https://rental-prime-backend-8ilt.onrender.com';

async function testPlanAPI() {
  console.log('🧪 Testing Plan API endpoints...\n');

  try {
    // Test GET /api/plans
    console.log('📋 Testing GET /api/plans');
    const response = await fetch(`${API_BASE_URL}/api/plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ GET /api/plans successful');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ GET /api/plans failed');
      console.log('Status:', response.status);
      console.log('Response:', await response.text());
    }

  } catch (error) {
    console.error('❌ Error testing Plan API:', error.message);
  }
}

testPlanAPI();
