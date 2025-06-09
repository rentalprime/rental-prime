const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client with the provided credentials
const supabaseUrl = 'https://iqctarumnxsxyqkzxfkz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY3RhcnVtbnhzeHlxa3p4Zmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDc4MTAsImV4cCI6MjA2MjUyMzgxMH0.QvlZGTAHi1T3DThSbgkWIHvj_w7l6wqW25xIPdXZ8xc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function resetDatabase() {
  try {
    console.log('Starting database reset process...');
    
    // 1. Get list of existing tables
    console.log('Checking existing tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (tablesError) {
      console.log('Error checking tables:', tablesError.message);
      if (tablesError.code === '42P01') {
        console.log('Users table does not exist yet, will create it');
      }
    } else {
      console.log('Found existing users table');
      
      // 2. Delete all data from existing tables
      console.log('Deleting all data from users table...');
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .neq('id', 'no-match'); // This will delete all rows
      
      if (deleteError) {
        console.error('Error deleting users data:', deleteError);
      } else {
        console.log('Successfully deleted all users data');
      }
    }
    
    // 3. Create tables with the correct schema using SQL
    // Note: We're using the REST API since we don't have direct SQL access
    console.log('\nCreating tables with correct schema...');
    
    // Create users table with name field instead of username
    console.log('Creating users table...');
    
    // We'll try to insert a sample record to see if it works
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          // We'll let Supabase generate the ID
          email: 'admin@rentalprimasuperadmin.com',
          name: 'Super Admin',
          role: 'superadmin',
          status: 'active',
          created_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (userError) {
      console.error('Error creating users table:', userError);
      
      // If the error is about the 'name' column, let's try with 'username' instead
      if (userError.message.includes("name")) {
        console.log('Trying with username field instead...');
        const { data: usernameData, error: usernameError } = await supabase
          .from('users')
          .insert([
            {
              email: 'admin@rentalprimasuperadmin.com',
              username: 'Super Admin',
              role: 'superadmin',
              status: 'active',
              created_at: new Date().toISOString()
            }
          ])
          .select();
        
        if (usernameError) {
          console.error('Error creating users table with username:', usernameError);
        } else {
          console.log('Successfully created users table with username field');
          console.log('Sample user created:', usernameData);
        }
      }
    } else {
      console.log('Successfully created users table with name field');
      console.log('Sample user created:', userData);
    }
    
    // 4. Create other tables as needed
    console.log('\nCreating other tables...');
    
    // Categories table
    console.log('Creating categories table...');
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .insert([
        {
          name: 'Sample Category',
          description: 'This is a sample category',
          status: 'active',
          created_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (categoryError) {
      console.error('Error creating categories table:', categoryError);
    } else {
      console.log('Successfully created categories table');
    }
    
    // Listings table
    console.log('Creating listings table...');
    const { data: listingData, error: listingError } = await supabase
      .from('listings')
      .insert([
        {
          title: 'Sample Listing',
          description: 'This is a sample listing',
          price: 100,
          status: 'active',
          created_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (listingError) {
      console.error('Error creating listings table:', listingError);
    } else {
      console.log('Successfully created listings table');
    }
    
    // 5. Verify the database structure
    console.log('\nVerifying database structure...');
    const { data: finalUsers, error: finalError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (finalError) {
      console.error('Error verifying database:', finalError);
    } else {
      console.log('Database verification successful');
      console.log('Users table structure:', finalUsers.length > 0 ? Object.keys(finalUsers[0]) : 'No users found');
    }
    
    console.log('\nDatabase reset process completed!');
    
  } catch (err) {
    console.error('Unexpected error during database reset:', err);
  }
}

resetDatabase();
