const axios = require('axios');

// Base URL for API
const API_URL = 'http://localhost:5001/api';

// Login credentials - replace with your actual credentials
const credentials = {
  // Using a vendor user from the insert_simple_listings.sql script
  email: 'rajesh@example.com', // Vendor user from the SQL script
  password: 'password123' // The hashed password in the SQL script is for 'password123'
};

async function getAuthToken() {
  try {
    console.log('Logging in to get auth token...');
    const response = await axios.post(`${API_URL}/auth/login`, credentials, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data && response.data.token) {
      console.log('✅ Login successful');
      console.log('Your auth token is:');
      console.log(response.data.token);
      console.log('\nUpdate the AUTH_TOKEN variable in test-listing-api.js with this token');
      return response.data.token;
    } else {
      console.error('❌ Login failed: No token in response');
      console.log('Response:', response.data);
    }
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
  }
}

// Run the function
getAuthToken();
