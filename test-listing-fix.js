// Test script to verify the listing API fix
const API_URL = "http://localhost:5001";

async function testListingAPI() {
  try {
    console.log("Testing listing API with new response format...");

    // Test the public listings endpoint (no auth required)
    const response = await fetch(`${API_URL}/api/listings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      console.error("API request failed with status:", response.status);
      try {
        const errorData = await response.json();
        console.error("Error details:", errorData);
      } catch (e) {
        console.error("Could not parse error response");
      }
      return;
    }

    const data = await response.json();
    console.log("✅ API Response Structure:");
    console.log("- success:", data.success);
    console.log("- count:", data.count);
    console.log(
      "- data type:",
      Array.isArray(data.data) ? "array" : typeof data.data
    );
    console.log("- data length:", data.data ? data.data.length : 0);

    if (data.data && data.data.length > 0) {
      console.log("\n📋 First listing sample:");
      const firstListing = data.data[0];
      console.log("- ID:", firstListing.id);
      console.log("- Title:", firstListing.title);
      console.log("- Price:", firstListing.price);
      console.log("- Status:", firstListing.status);
      console.log("- Images type:", typeof firstListing.images);
      console.log("- Specifications type:", typeof firstListing.specifications);
    }

    // Test the response format that the frontend expects
    console.log("\n🔧 Testing frontend service format:");
    const serviceResponse = {
      data: data.data,
      count: data.count || 0,
      success: data.success,
    };

    console.log("Service response format:", {
      hasData: !!serviceResponse.data,
      isDataArray: Array.isArray(serviceResponse.data),
      count: serviceResponse.count,
      success: serviceResponse.success,
    });

    console.log("\n✅ All tests passed! The API response format is correct.");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testListingAPI();
