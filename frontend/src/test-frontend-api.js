// Test script to verify frontend API connectivity

// API URL from environment variable or default
const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://rental-prime-backend-8ilt.onrender.com";

// Function to test fetching listings
async function testFetchListings() {
  try {
    const response = await fetch(`${API_URL}/api/listings`);

    if (response.ok) {
      const data = await response.json();

      // Process listings to handle JSON strings
      if (data.data && data.data.length > 0) {
        const processedListings = data.data.map((listing) => {
          const processedListing = { ...listing };

          // Parse images if they're stored as a JSON string
          if (
            processedListing.images &&
            typeof processedListing.images === "string"
          ) {
            try {
              processedListing.images = JSON.parse(processedListing.images);
            } catch (e) {
              processedListing.images = [];
            }
          } else if (!processedListing.images) {
            processedListing.images = [];
          }

          // Parse specifications if they're stored as a JSON string
          if (
            processedListing.specifications &&
            typeof processedListing.specifications === "string"
          ) {
            try {
              processedListing.specifications = JSON.parse(
                processedListing.specifications
              );
            } catch (e) {
              processedListing.specifications = [];
            }
          } else if (!processedListing.specifications) {
            processedListing.specifications = [];
          }

          return processedListing;
        });
      }
    } else {
      try {
        const errorData = await response.json();
      } catch (e) {
        // Could not parse error response
      }
    }
  } catch (error) {
    // Error connecting to API
  }
}

// Run the test
testFetchListings();
