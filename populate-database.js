const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client with the provided credentials
const supabaseUrl = 'https://iqctarumnxsxyqkzxfkz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY3RhcnVtbnhzeHlxa3p4Zmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDc4MTAsImV4cCI6MjA2MjUyMzgxMH0.QvlZGTAHi1T3DThSbgkWIHvj_w7l6wqW25xIPdXZ8xc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Main function to populate the database
async function populateDatabase() {
  try {
    console.log('Starting database population...');
    
    // 1. Insert users
    console.log('\nInserting users...');
    const users = [
      {
        name: 'Super Admin',
        email: 'admin@rentalprimasuperadmin.com',
        password: 'hashed_password_here', // In production, this should be properly hashed
        user_type: 'super_admin',
        role: 'admin',
        status: 'active'
      },
      {
        name: 'Property Owner',
        email: 'owner@example.com',
        password: 'hashed_password_here', // In production, this should be properly hashed
        user_type: 'owner',
        role: 'admin',
        status: 'active'
      },
      {
        name: 'Regular Customer',
        email: 'customer@example.com',
        password: 'hashed_password_here', // In production, this should be properly hashed
        user_type: 'customer',
        role: 'customer',
        status: 'active'
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
    
    // 2. Insert categories
    console.log('\nInserting categories...');
    const categories = [
      {
        name: 'Apartments',
        description: 'Apartment rentals including flats and condos',
        status: 'active'
      },
      {
        name: 'Houses',
        description: 'Full house rentals including villas and cottages',
        status: 'active'
      },
      {
        name: 'Commercial',
        description: 'Commercial properties for business use',
        status: 'active'
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
    
    // 3. Insert settings
    console.log('\nInserting settings...');
    const settings = [
      {
        key: 'site_name',
        value: 'Rental Prima'
      },
      {
        key: 'contact_email',
        value: 'contact@rentalprimasuperadmin.com'
      },
      {
        key: 'support_phone',
        value: '+1-800-RENTAL'
      }
    ];
    
    for (const setting of settings) {
      const { data: settingData, error: settingError } = await supabase
        .from('settings')
        .insert([setting])
        .select();
      
      if (settingError) {
        console.log(`Error inserting setting ${setting.key}:`, settingError);
      } else {
        console.log(`Successfully inserted setting ${setting.key}:`, settingData[0]);
      }
    }
    
    // 4. Insert plans
    console.log('\nInserting plans...');
    const plans = [
      {
        name: 'Basic Plan',
        description: 'Basic features for small businesses',
        price: 9.99,
        features: JSON.stringify({
          listings: 10,
          featured: 1,
          support: 'email'
        }),
        status: 'active'
      },
      {
        name: 'Premium Plan',
        description: 'Advanced features for growing businesses',
        price: 19.99,
        features: JSON.stringify({
          listings: 50,
          featured: 5,
          support: '24/7'
        }),
        status: 'active'
      }
    ];
    
    for (const plan of plans) {
      const { data: planData, error: planError } = await supabase
        .from('plans')
        .insert([plan])
        .select();
      
      if (planError) {
        console.log(`Error inserting plan ${plan.name}:`, planError);
      } else {
        console.log(`Successfully inserted plan ${plan.name}:`, planData[0]);
      }
    }
    
    // 5. Verify the database population
    console.log('\n--- VERIFYING DATABASE POPULATION ---');
    const tables = ['users', 'categories', 'settings', 'plans'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*');
        
        if (error) {
          console.log(`Error verifying ${table}:`, error);
        } else {
          console.log(`Found ${data.length} records in ${table} table`);
          if (data.length > 0) {
            console.log(`${table} table structure:`, Object.keys(data[0]));
            console.log(`Sample ${table} record:`, data[0]);
          }
        }
      } catch (err) {
        console.error(`Error during verification of ${table}:`, err);
      }
    }
    
    console.log('\nDatabase population completed!');
    
  } catch (err) {
    console.error('Unexpected error during database population:', err);
  }
}

populateDatabase();
