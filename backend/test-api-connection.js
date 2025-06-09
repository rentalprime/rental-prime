const fetch = require('node-fetch');

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Test API connection
async function testApiConnection() {
  try {
    console.log(`Testing API connection to ${API_URL}/api/listings`);
    
    const response = await fetch(`${API_URL}/api/listings`);
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API response successful!');
      console.log('Response structure:', JSON.stringify(data, null, 2));
      console.log('Number of listings:', data.data ? data.data.length : 0);
    } else {
      console.error('API request failed with status:', response.status);
      try {
        const errorData = await response.json();
        console.error('Error details:', errorData);
      } catch (e) {
        console.error('Could not parse error response');
      }
    }
  } catch (error) {
    console.error('Error connecting to API:', error.message);
  }
}

// Run the test
testApiConnection();
