const axios = require('axios');

// Base URL for API
const API_URL = 'http://localhost:5001/api';

// Function to test getting all listings
async function fetchListings() {
  try {
    console.log('Fetching all listings from API...');
    const response = await axios.get(`${API_URL}/listings`);
    
    console.log('✅ Fetch successful');
    // Handle the nested data structure from our API
    const listings = response.data.data || [];
    console.log(`Retrieved ${listings.length || 0} listings`);
    console.log(`Total count: ${response.data.count || 0}`);
    console.log('\nFirst listing details:');
    if (listings && listings.length > 0) {
      console.log(JSON.stringify(listings[0], null, 2));
    } else {
      console.log('No listings found');
    }
    return response.data;
  } catch (error) {
    console.error('❌ Fetch failed:', error.response?.data || error.message);
    return null;
  }
}

// Function to test getting featured listings
async function fetchFeaturedListings() {
  try {
    console.log('\nFetching featured listings from API...');
    const response = await axios.get(`${API_URL}/listings/featured`);
    
    console.log('✅ Fetch successful');
    // Handle the nested data structure from our API
    const featuredListings = response.data.data || [];
    console.log(`Retrieved ${featuredListings.length || 0} featured listings`);
    return response.data;
  } catch (error) {
    console.error('❌ Fetch failed:', error.response?.data || error.message);
    return null;
  }
}

// Run the functions
async function run() {
  await fetchListings();
  await fetchFeaturedListings();
}

run().catch(error => {
  console.error('Error:', error);
});
