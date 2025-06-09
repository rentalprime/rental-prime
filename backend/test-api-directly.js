const axios = require('axios');

// Test direct API connection
async function testApiDirectly() {
  try {
    console.log('Testing direct API connection...');
    const response = await axios.get('http://localhost:5001/api/listings');
    
    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', response.headers);
    console.log('API Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.data) {
      console.log(`Found ${response.data.data.length} listings`);
    } else {
      console.log('No listings found or unexpected response format');
    }
  } catch (error) {
    console.error('Error connecting to API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testApiDirectly();
