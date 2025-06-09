// Simple script to test API connection from the frontend
const API_URL = 'http://localhost:5001';

async function testApiConnection() {
  try {
    console.log('Testing API connection to:', `${API_URL}/api/listings`);
    
    const response = await fetch(`${API_URL}/api/listings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      console.error('API connection failed with status:', response.status);
      try {
        const errorData = await response.json();
        console.error('Error details:', errorData);
      } catch (e) {
        console.error('Could not parse error response');
      }
      return;
    }
    
    const data = await response.json();
    console.log('API connection successful!');
    console.log('Response data:', data);
    
    if (data && data.data) {
      console.log(`Retrieved ${data.data.length} listings`);
      if (data.data.length > 0) {
        console.log('First listing:', data.data[0]);
      }
    } else {
      console.log('No listings found or unexpected response format');
    }
  } catch (error) {
    console.error('Error testing API connection:', error);
  }
}

// Run the test
testApiConnection();

// To run this script:
// 1. Open your browser console
// 2. Copy and paste this entire script
// 3. Press Enter to execute
