const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://iqctarumnxsxyqkzxfkz.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY3RhcnVtbnhzeHlxa3p4Zmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDc4MTAsImV4cCI6MjA2MjUyMzgxMH0.QvlZGTAHi1T3DThSbgkWIHvj_w7l6wqW25xIPdXZ8xc';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// First, insert a test user and category
async function setupTestData() {
  console.log('Setting up test data...');
  
  // Insert test category
  const categoryId = '11111111-1111-1111-1111-111111111111';
  const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .upsert([
      {
        id: categoryId,
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ], { onConflict: 'id' });
  
  if (categoryError) {
    console.error('Error inserting category:', categoryError);
    return null;
  }
  
  // Insert test user
  const userId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const { data: userData, error: userError } = await supabase
    .from('users')
    .upsert([
      {
        id: userId,
        name: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        password: '$2a$10$xVqYLGUuJ9Qh0JMn1VIbUeUFJUqGYjXvJ.hJ1ew8Qm0YR9.6smJwC', // password123
        user_type: 'vendor',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ], { onConflict: 'id' });
  
  if (userError) {
    console.error('Error inserting user:', userError);
    return null;
  }
  
  return { categoryId, userId };
}

// Insert a test listing
async function insertTestListing() {
  // First set up the test data
  const testData = await setupTestData();
  if (!testData) {
    console.error('Failed to set up test data');
    return;
  }
  
  const { categoryId, userId } = testData;
  
  // Create test listing
  const testListing = {
    title: 'Professional DSLR Camera',
    description: 'High-quality camera for professional photography and videography',
    price: 3500,
    category_id: categoryId,
    user_id: userId,
    location: 'Mumbai, Maharashtra',
    is_featured: true,
    status: 'active',
    brand: 'Nikon',
    condition: 'Like New',
    specifications: JSON.stringify([
      { key: 'Model', value: 'D850' },
      { key: 'Resolution', value: '45.7 MP' },
      { key: 'Sensor', value: 'Full-frame CMOS' },
      { key: 'Weight', value: '1005g' }
    ]),
    price_period: 'day',
    deposit: 15000,
    min_duration: 2,
    available_from: new Date('2025-06-01').toISOString(),
    available_to: new Date('2025-12-31').toISOString(),
    delivery: true,
    shipping: 500,
    rental_terms: 'Aadhar card required, security deposit required',
    accept_deposit: true,
    cancellation: 'moderate',
    notes: 'Comes with extra battery, 64GB SD card, and carrying case',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: JSON.stringify([
      'https://example.com/images/camera1.jpg',
      'https://example.com/images/camera2.jpg'
    ])
  };
  
  console.log('Inserting test listing...');
  const { data, error } = await supabase
    .from('listings')
    .insert([testListing]);
  
  if (error) {
    console.error('Error inserting listing:', error);
  } else {
    console.log('Test listing inserted successfully!');
  }
  
  // Fetch all listings to verify
  const { data: listings, error: fetchError } = await supabase
    .from('listings')
    .select('*');
  
  if (fetchError) {
    console.error('Error fetching listings:', fetchError);
  } else {
    console.log(`Found ${listings.length} listings in the database`);
    if (listings.length > 0) {
      console.log('First listing:', listings[0]);
    }
  }
}

// Run the function
insertTestListing().catch(error => {
  console.error('Unexpected error:', error);
});
