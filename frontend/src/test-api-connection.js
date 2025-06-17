// Simple script to test API connection from the frontend
const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://rental-prime-backend-8ilt.onrender.com";

async function testApiConnection() {
  try {
    const response = await fetch(`${API_URL}/api/listings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
      } catch (e) {
        // Could not parse error response
      }
      return;
    }

    const data = await response.json();
    // API connection successful - data retrieved
  } catch (error) {
    // Error testing API connection
  }
}

// Run the test
testApiConnection();

// To run this script:
// 1. Open your browser console
// 2. Copy and paste this entire script
// 3. Press Enter to execute
