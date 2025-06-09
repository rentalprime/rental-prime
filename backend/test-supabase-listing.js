const { createClient } = require('@supabase/supabase-js');
const config = require('./config/config');

// Initialize Supabase client
const supabase = createClient(config.supabaseUrl, config.supabaseKey);

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
  notes: 'Comes with extra battery, 64GB SD card, and carrying case',
  user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', // Rajesh Kumar from our dummy data
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Function to test creating a listing
async function testCreateListing() {
  try {
    console.log('Testing create listing in Supabase...');
    const { data, error } = await supabase
      .from('listings')
      .insert([testListing])
      .select();
    
    if (error) {
      console.error('❌ Create listing failed:', error);
      return null;
    }
    
    console.log('✅ Create listing successful');
    console.log('Created listing:', data[0]);
    
    // Return the created listing ID for further tests
    return data[0].id;
  } catch (error) {
    console.error('❌ Create listing failed:', error.message);
    return null;
  }
}

// Function to test getting all listings
async function testGetListings() {
  try {
    console.log('\nTesting get all listings from Supabase...');
    const { data, error, count } = await supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .limit(10);
    
    if (error) {
      console.error('❌ Get all listings failed:', error);
      return null;
    }
    
    console.log('✅ Get all listings successful');
    console.log(`Retrieved ${data.length} listings`);
    return data;
  } catch (error) {
    console.error('❌ Get all listings failed:', error.message);
    return null;
  }
}

// Function to test getting a single listing
async function testGetListing(id) {
  try {
    console.log(`\nTesting get listing from Supabase for ID: ${id}...`);
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        category:category_id(*),
        user:user_id(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('❌ Get listing failed:', error);
      return null;
    }
    
    console.log('✅ Get listing successful');
    console.log('Retrieved listing:', data);
    return data;
  } catch (error) {
    console.error('❌ Get listing failed:', error.message);
    return null;
  }
}

// Function to test updating a listing
async function testUpdateListing(id) {
  try {
    console.log(`\nTesting update listing in Supabase for ID: ${id}...`);
    const updateData = {
      price: 4000, // Updated price in INR
      deposit: 20000, // Updated deposit in INR
      notes: 'Updated notes: Now includes 128GB SD card, tripod, and extra lens',
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('listings')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('❌ Update listing failed:', error);
      return null;
    }
    
    console.log('✅ Update listing successful');
    console.log('Updated listing:', data[0]);
    return data[0];
  } catch (error) {
    console.error('❌ Update listing failed:', error.message);
    return null;
  }
}

// Function to test deleting a listing
async function testDeleteListing(id) {
  try {
    console.log(`\nTesting delete listing from Supabase for ID: ${id}...`);
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Delete listing failed:', error);
      return false;
    }
    
    console.log('✅ Delete listing successful');
    return true;
  } catch (error) {
    console.error('❌ Delete listing failed:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('Starting Listing API tests with Supabase...\n');
  
  // Test creating a listing
  const createdListingId = await testCreateListing();
  
  if (createdListingId) {
    // Test getting all listings
    await testGetListings();
    
    // Test getting a single listing
    await testGetListing(createdListingId);
    
    // Test updating a listing
    await testUpdateListing(createdListingId);
    
    // Test deleting a listing
    await testDeleteListing(createdListingId);
  }
  
  console.log('\nListing API tests completed');
}

// Run the tests
runTests().catch(error => {
  console.error('Test error:', error);
});
