const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client with the provided credentials
const supabaseUrl = 'https://iqctarumnxsxyqkzxfkz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY3RhcnVtbnhzeHlxa3p4Zmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDc4MTAsImV4cCI6MjA2MjUyMzgxMH0.QvlZGTAHi1T3DThSbgkWIHvj_w7l6wqW25xIPdXZ8xc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectDatabase() {
  try {
    console.log('Starting database inspection...');
    
    // Try to get the structure of the users table
    console.log('\n--- USERS TABLE INSPECTION ---');
    try {
      // First attempt to insert a minimal record to see what fields are required
      const { data: minimalUser, error: minimalError } = await supabase
        .from('users')
        .insert([{ 
          email: 'test-minimal@example.com',
          username: 'Test User',
          password_hash: 'test-password-hash' // Based on previous error
        }])
        .select();
      
      if (minimalError) {
        console.log('Minimal insert error:', minimalError);
      } else {
        console.log('Successfully inserted minimal user');
        console.log('User structure:', Object.keys(minimalUser[0]));
        console.log('User data:', minimalUser[0]);
      }
    } catch (err) {
      console.error('Error during users table inspection:', err);
    }
    
    // Try to query the users table to see its structure
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (usersError) {
        console.log('Error querying users:', usersError);
      } else {
        console.log('\nUsers table query successful');
        if (users.length > 0) {
          console.log('Users table columns:', Object.keys(users[0]));
          console.log('Sample user:', users[0]);
        } else {
          console.log('Users table exists but is empty');
        }
      }
    } catch (err) {
      console.error('Error querying users table:', err);
    }
    
    // Check auth.users table
    console.log('\n--- AUTH TABLES INSPECTION ---');
    try {
      const { data: authUsers, error: authError } = await supabase
        .from('auth.users')
        .select('*')
        .limit(1);
      
      if (authError) {
        console.log('Error querying auth.users:', authError);
      } else {
        console.log('Auth.users query successful');
        if (authUsers.length > 0) {
          console.log('Auth.users columns:', Object.keys(authUsers[0]));
        } else {
          console.log('Auth.users table exists but is empty');
        }
      }
    } catch (err) {
      console.error('Error querying auth.users table:', err);
    }
    
    // Check categories table
    console.log('\n--- CATEGORIES TABLE INSPECTION ---');
    try {
      // Try a minimal insert to see required fields
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .insert([{ name: 'Test Category' }])
        .select();
      
      if (categoryError) {
        console.log('Error inserting category:', categoryError);
        
        // Try to query the table to see its structure
        const { data: categories, error: queryError } = await supabase
          .from('categories')
          .select('*')
          .limit(1);
        
        if (queryError) {
          console.log('Error querying categories:', queryError);
        } else {
          console.log('Categories query successful');
          if (categories.length > 0) {
            console.log('Categories columns:', Object.keys(categories[0]));
            console.log('Sample category:', categories[0]);
          } else {
            console.log('Categories table exists but is empty');
          }
        }
      } else {
        console.log('Successfully inserted category');
        console.log('Category structure:', Object.keys(category[0]));
      }
    } catch (err) {
      console.error('Error during categories inspection:', err);
    }
    
    // Check listings table
    console.log('\n--- LISTINGS TABLE INSPECTION ---');
    try {
      // Try a minimal insert to see required fields
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert([{ title: 'Test Listing' }])
        .select();
      
      if (listingError) {
        console.log('Error inserting listing:', listingError);
        
        // Try to query the table to see its structure
        const { data: listings, error: queryError } = await supabase
          .from('listings')
          .select('*')
          .limit(1);
        
        if (queryError) {
          console.log('Error querying listings:', queryError);
        } else {
          console.log('Listings query successful');
          if (listings.length > 0) {
            console.log('Listings columns:', Object.keys(listings[0]));
            console.log('Sample listing:', listings[0]);
          } else {
            console.log('Listings table exists but is empty');
          }
        }
      } else {
        console.log('Successfully inserted listing');
        console.log('Listing structure:', Object.keys(listing[0]));
      }
    } catch (err) {
      console.error('Error during listings inspection:', err);
    }
    
    // List all tables in the database
    console.log('\n--- ALL TABLES INSPECTION ---');
    try {
      // Try to get a list of all tables
      const { data, error } = await supabase
        .rpc('get_tables');
      
      if (error) {
        console.log('Error listing tables:', error);
      } else {
        console.log('All tables in database:', data);
      }
    } catch (err) {
      console.error('Error listing tables:', err);
    }
    
    console.log('\nDatabase inspection completed!');
    
  } catch (err) {
    console.error('Unexpected error during database inspection:', err);
  }
}

inspectDatabase();
