// Test script to verify frontend API connectivity
console.log('Testing frontend API connectivity...');

// API URL from environment variable or default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Function to test fetching listings
async function testFetchListings() {
  try {
    console.log(`Fetching listings from ${API_URL}/api/listings`);
    
    const response = await fetch(`${API_URL}/api/listings`);
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API response successful!');
      console.log('Response structure:', data);
      console.log('Number of listings:', data.data ? data.data.length : 0);
      
      // Process listings to handle JSON strings
      if (data.data && data.data.length > 0) {
        const processedListings = data.data.map(listing => {
          const processedListing = { ...listing };
          
          // Parse images if they're stored as a JSON string
          if (processedListing.images && typeof processedListing.images === 'string') {
            try {
              processedListing.images = JSON.parse(processedListing.images);
            } catch (e) {
              console.error('Error parsing images JSON:', e);
              processedListing.images = [];
            }
          } else if (!processedListing.images) {
            processedListing.images = [];
          }
          
          // Parse specifications if they're stored as a JSON string
          if (processedListing.specifications && typeof processedListing.specifications === 'string') {
            try {
              processedListing.specifications = JSON.parse(processedListing.specifications);
            } catch (e) {
              console.error('Error parsing specifications JSON:', e);
              processedListing.specifications = [];
            }
          } else if (!processedListing.specifications) {
            processedListing.specifications = [];
          }
          
          return processedListing;
        });
        
        console.log('First processed listing:', processedListings[0]);
      }
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
testFetchListings();
