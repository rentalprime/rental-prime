const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client with the provided credentials
const supabaseUrl = 'https://iqctarumnxsxyqkzxfkz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY3RhcnVtbnhzeHlxa3p4Zmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDc4MTAsImV4cCI6MjA2MjUyMzgxMH0.QvlZGTAHi1T3DThSbgkWIHvj_w7l6wqW25xIPdXZ8xc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Main function to set up the database data
async function setupDatabaseData() {
  try {
    console.log('Starting database data setup...');
    
    // 1. Clear existing data from tables
    console.log('\nClearing existing data...');
    
    // Clear users table
    console.log('Clearing users table...');
    const { error: usersClearError } = await supabase
      .from('users')
      .delete()
      .neq('user_id', 0); // This will delete all rows
    
    if (usersClearError) {
      console.log('Error clearing users table:', usersClearError);
    } else {
      console.log('Successfully cleared users table');
    }
    
    // Clear categories table
    console.log('Clearing categories table...');
    const { error: categoriesClearError } = await supabase
      .from('categories')
      .delete()
      .neq('category_id', 0); // This will delete all rows
    
    if (categoriesClearError) {
      console.log('Error clearing categories table:', categoriesClearError);
    } else {
      console.log('Successfully cleared categories table');
    }
    
    // 2. Insert initial data into tables
    console.log('\nInserting initial data...');
    
    // Insert users
    console.log('Inserting users...');
    const users = [
      {
        username: 'super_admin_user',
        email: 'admin@rentalprimasuperadmin.com',
        password_hash: '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // This is a placeholder hash
        first_name: 'Super Admin',
        last_name: ' ',
        role: 'admin', // Using 'admin' as it's one of the allowed values
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        username: 'owner_user',
        email: 'owner@example.com',
        password_hash: '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // This is a placeholder hash
        first_name: 'Property Owner',
        last_name: ' ',
        role: 'admin', // Using 'admin' as it's one of the allowed values
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        username: 'customer_user',
        email: 'customer@example.com',
        password_hash: '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // This is a placeholder hash
        first_name: 'Regular Customer',
        last_name: ' ',
        role: 'customer', // Using 'customer' as it's one of the allowed values
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    for (const user of users) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([user])
        .select();
      
      if (userError) {
        console.log(`Error inserting user ${user.email}:`, userError);
      } else {
        console.log(`Successfully inserted user ${user.email}:`, userData[0]);
      }
    }
    
    // Insert categories
    console.log('\nInserting categories...');
    const categories = [
      {
        name: 'Apartments',
        description: 'Apartment rentals including flats and condos',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        name: 'Houses',
        description: 'Full house rentals including villas and cottages',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        name: 'Commercial',
        description: 'Commercial properties for business use',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    for (const category of categories) {
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .insert([category])
        .select();
      
      if (categoryError) {
        console.log(`Error inserting category ${category.name}:`, categoryError);
      } else {
        console.log(`Successfully inserted category ${category.name}:`, categoryData[0]);
      }
    }
    
    // 3. Verify the database setup
    console.log('\n--- VERIFYING DATABASE SETUP ---');
    try {
      // Check users
      const { data: usersCheck, error: usersError } = await supabase
        .from('users')
        .select('*');
      
      if (usersError) {
        console.log('Error verifying users:', usersError);
      } else {
        console.log(`Found ${usersCheck.length} users in the database`);
        if (usersCheck.length > 0) {
          console.log('User table structure:', Object.keys(usersCheck[0]));
          console.log('Sample user:', usersCheck[0]);
        }
      }
      
      // Check categories
      const { data: categoriesCheck, error: categoriesError } = await supabase
        .from('categories')
        .select('*');
      
      if (categoriesError) {
        console.log('Error verifying categories:', categoriesError);
      } else {
        console.log(`Found ${categoriesCheck.length} categories in the database`);
        if (categoriesCheck.length > 0) {
          console.log('Category table structure:', Object.keys(categoriesCheck[0]));
          console.log('Sample category:', categoriesCheck[0]);
        }
      }
    } catch (err) {
      console.error('Error during verification:', err);
    }
    
    console.log('\nDatabase data setup completed!');
    
  } catch (err) {
    console.error('Unexpected error during database data setup:', err);
  }
}

setupDatabaseData();
