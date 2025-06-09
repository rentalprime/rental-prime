const axios = require('axios');

// Base URL for API
const API_URL = 'http://localhost:5001/api';

// Auth token - you'll need to get this from logging in
// You can use the /api/auth/login endpoint to get a token
const AUTH_TOKEN = 'YOUR_AUTH_TOKEN_HERE'; // Replace with your actual token

// Test data for creating a listing with Indian standards
const testListing = {
  title: 'Professional DSLR Camera',
  description: 'High-quality camera for professional photography and videography',
  price: 3500, // Price in INR
  category_id: '11111111-1111-1111-1111-111111111111', // Electronics category from our dummy data
  location: 'Mumbai, Maharashtra',
  brand: 'Nikon',
  condition: 'Like New',
  specifications: [
    { key: 'Model', value: 'D850' },
    { key: 'Resolution', value: '45.7 MP' },
    { key: 'Sensor', value: 'Full-frame CMOS' },
    { key: 'Weight', value: '1005g' }
  ],
  price_period: 'day',
  deposit: 15000, // Deposit in INR
  min_duration: 2,
  available_from: '2025-06-01',
  available_to: '2025-12-31',
  delivery: true,
  shipping: 500, // Shipping in INR
  rental_terms: 'Aadhar card required, security deposit required',
  accept_deposit: true,
  cancellation: 'moderate',
  notes: 'Comes with extra battery, 64GB SD card, and carrying case'
};

// Function to test creating a listing
async function testCreateListing() {
  try {
    console.log('Testing create listing API...');
    const response = await axios.post(`${API_URL}/listings`, testListing, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    
    console.log('✅ Create listing successful');
    console.log('Created listing:', response.data);
    
    // Return the created listing ID for further tests
    return response.data.id || (response.data.data && response.data.data.id);
  } catch (error) {
    console.error('❌ Create listing failed:', error.response?.data || error.message);
    return null;
  }
}

// Function to test getting all listings
async function testGetListings() {
  try {
    console.log('\nTesting get all listings API...');
    const response = await axios.get(`${API_URL}/listings`);
    
    console.log('✅ Get all listings successful');
    console.log(`Retrieved ${response.data.count} listings`);
    return response.data;
  } catch (error) {
    console.error('❌ Get all listings failed:', error.response?.data || error.message);
    return null;
  }
}

// Function to test getting a single listing
async function testGetListing(id) {
  try {
    console.log(`\nTesting get listing API for ID: ${id}...`);
    const response = await axios.get(`${API_URL}/listings/${id}`);
    
    console.log('✅ Get listing successful');
    console.log('Retrieved listing:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get listing failed:', error.response?.data || error.message);
    return null;
  }
}

// Function to test updating a listing
async function testUpdateListing(id) {
  try {
    console.log(`\nTesting update listing API for ID: ${id}...`);
    const updateData = {
      price: 4000, // Updated price in INR
      deposit: 20000, // Updated deposit in INR
      notes: 'Updated notes: Now includes 128GB SD card, tripod, and extra lens'
    };
    
    const response = await axios.put(`${API_URL}/listings/${id}`, updateData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    
    console.log('✅ Update listing successful');
    console.log('Updated listing:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Update listing failed:', error.response?.data || error.message);
    return null;
  }
}

// Function to test deleting a listing
async function testDeleteListing(id) {
  try {
    console.log(`\nTesting delete listing API for ID: ${id}...`);
    const response = await axios.delete(`${API_URL}/listings/${id}`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    
    console.log('✅ Delete listing successful');
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Delete listing failed:', error.response?.data || error.message);
    return null;
  }
}

// Function to test getting featured listings
async function testGetFeaturedListings() {
  try {
    console.log('\nTesting get featured listings API...');
    const response = await axios.get(`${API_URL}/listings/featured`);
    
    console.log('✅ Get featured listings successful');
    console.log(`Retrieved ${response.data.length || 0} featured listings`);
    return response.data;
  } catch (error) {
    console.error('❌ Get featured listings failed:', error.response?.data || error.message);
    return null;
  }
}

// Function to test getting listings by category
async function testGetListingsByCategory(categoryId) {
  try {
    console.log(`\nTesting get listings by category API for category ID: ${categoryId}...`);
    const response = await axios.get(`${API_URL}/listings/category/${categoryId}`);
    
    console.log('✅ Get listings by category successful');
    console.log(`Retrieved ${response.data.length || 0} listings for category`);
    return response.data;
  } catch (error) {
    console.error('❌ Get listings by category failed:', error.response?.data || error.message);
    return null;
  }
}

// Function to test getting listings by vendor
async function testGetListingsByVendor(vendorId) {
  try {
    console.log(`\nTesting get listings by vendor API for vendor ID: ${vendorId}...`);
    const response = await axios.get(`${API_URL}/listings/vendor/${vendorId}`);
    
    console.log('✅ Get listings by vendor successful');
    console.log(`Retrieved ${response.data.length || 0} listings for vendor`);
    return response.data;
  } catch (error) {
    console.error('❌ Get listings by vendor failed:', error.response?.data || error.message);
    return null;
  }
}

// Run all tests
async function runTests() {
  console.log('Starting Listing API tests...\n');
  
  // Test getting all listings first
  const allListings = await testGetListings();
  
  // Test featured listings
  await testGetFeaturedListings();
  
  // If we have listings, test other endpoints with existing data
  if (allListings && allListings.length > 0) {
    const sampleListing = allListings[0];
    const listingId = sampleListing.id;
    const categoryId = sampleListing.category_id;
    const vendorId = sampleListing.user_id;
    
    // Test getting a single listing
    await testGetListing(listingId);
    
    // Test getting listings by category
    if (categoryId) {
      await testGetListingsByCategory(categoryId);
    }
    
    // Test getting listings by vendor
    if (vendorId) {
      await testGetListingsByVendor(vendorId);
    }
  }
  
  // Test creating a new listing
  const createdListingId = await testCreateListing();
  
  if (createdListingId) {
    // Test getting the created listing
    await testGetListing(createdListingId);
    
    // Test updating the created listing
    await testUpdateListing(createdListingId);
    
    // Test deleting the created listing
    await testDeleteListing(createdListingId);
  }
  
  console.log('\nListing API tests completed');
}

// Run the tests
runTests().catch(error => {
  console.error('Test error:', error);
});
