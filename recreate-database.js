const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client with the provided credentials
const supabaseUrl = 'https://iqctarumnxsxyqkzxfkz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY3RhcnVtbnhzeHlxa3p4Zmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDc4MTAsImV4cCI6MjA2MjUyMzgxMH0.QvlZGTAHi1T3DThSbgkWIHvj_w7l6wqW25xIPdXZ8xc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to execute SQL queries
async function executeSQL(query, params = {}) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: query, params });
    if (error) {
      console.error('SQL Error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error executing SQL:', err);
    return false;
  }
}

// Function to check if a table exists
async function tableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      return false; // Table doesn't exist
    }
    return true; // Table exists
  } catch (err) {
    console.error(`Error checking if table ${tableName} exists:`, err);
    return false;
  }
}

// Function to drop a table if it exists
async function dropTableIfExists(tableName) {
  try {
    if (await tableExists(tableName)) {
      console.log(`Dropping table ${tableName}...`);
      
      // First, try to delete all records
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .neq('id', 'no-match'); // This will delete all rows
      
      if (deleteError) {
        console.log(`Error deleting records from ${tableName}:`, deleteError);
      } else {
        console.log(`Successfully deleted all records from ${tableName}`);
      }
      
      // We can't drop tables through the Supabase client API directly
      // But we've cleared the data, so we can proceed with recreation
      return true;
    }
    return true; // Table doesn't exist, so no need to drop
  } catch (err) {
    console.error(`Error dropping table ${tableName}:`, err);
    return false;
  }
}

// Main function to recreate the database
async function recreateDatabase() {
  try {
    console.log('Starting database recreation...');
    
    // 1. Drop existing tables if they exist
    const tablesToDrop = ['users', 'categories', 'listings', 'payments', 'plans', 'settings', 'notifications', 'support'];
    
    for (const table of tablesToDrop) {
      await dropTableIfExists(table);
    }
    
    // 2. Create tables based on application code
    console.log('\nCreating tables with correct schema...');
    
    // Create users table
    console.log('Creating users table...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: 'first-user-' + Date.now(),
          name: 'Super Admin',
          email: 'admin@rentalprimasuperadmin.com',
          password: 'hashed_password_here', // In production, this should be properly hashed
          role: 'super_admin',
          status: 'active',
          created_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (userError) {
      console.log('Error creating users table:', userError);
      
      // If the table doesn't exist, we need to create it first
      if (userError.code === '42P01') {
        console.log('Users table does not exist, creating it...');
        
        // Try to create the table directly
        const createUsersTableResult = await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE public.users (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              name TEXT NOT NULL,
              email TEXT UNIQUE NOT NULL,
              password TEXT NOT NULL,
              role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'owner', 'customer')),
              status TEXT NOT NULL DEFAULT 'active',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
          `
        });
        
        if (createUsersTableResult.error) {
          console.log('Error creating users table with SQL:', createUsersTableResult.error);
        } else {
          console.log('Successfully created users table with SQL');
          
          // Try inserting the admin user again
          const { data: retryUserData, error: retryUserError } = await supabase
            .from('users')
            .insert([
              {
                id: 'first-user-' + Date.now(),
                name: 'Super Admin',
                email: 'admin@rentalprimasuperadmin.com',
                password: 'hashed_password_here', // In production, this should be properly hashed
                role: 'super_admin',
                status: 'active',
                created_at: new Date().toISOString()
              }
            ])
            .select();
          
          if (retryUserError) {
            console.log('Error inserting admin user after table creation:', retryUserError);
          } else {
            console.log('Successfully inserted admin user after table creation:', retryUserData);
          }
        }
      }
    } else {
      console.log('Successfully created users table and inserted admin user:', userData);
    }
    
    // Create categories table
    console.log('\nCreating categories table...');
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .insert([
        {
          id: 'first-category-' + Date.now(),
          name: 'Sample Category',
          description: 'This is a sample category',
          status: 'active',
          created_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (categoryError) {
      console.log('Error creating categories table:', categoryError);
      
      // If the table doesn't exist, we need to create it first
      if (categoryError.code === '42P01') {
        console.log('Categories table does not exist, creating it...');
        
        // Try to create the table directly
        const createCategoriesTableResult = await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE public.categories (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              name TEXT NOT NULL,
              description TEXT,
              image_url TEXT,
              status TEXT NOT NULL DEFAULT 'active',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
          `
        });
        
        if (createCategoriesTableResult.error) {
          console.log('Error creating categories table with SQL:', createCategoriesTableResult.error);
        } else {
          console.log('Successfully created categories table with SQL');
          
          // Try inserting the sample category again
          const { data: retryCategoryData, error: retryCategoryError } = await supabase
            .from('categories')
            .insert([
              {
                id: 'first-category-' + Date.now(),
                name: 'Sample Category',
                description: 'This is a sample category',
                status: 'active',
                created_at: new Date().toISOString()
              }
            ])
            .select();
          
          if (retryCategoryError) {
            console.log('Error inserting sample category after table creation:', retryCategoryError);
          } else {
            console.log('Successfully inserted sample category after table creation:', retryCategoryData);
          }
        }
      }
    } else {
      console.log('Successfully created categories table and inserted sample category:', categoryData);
    }
    
    // Create listings table
    console.log('\nCreating listings table...');
    const { data: listingData, error: listingError } = await supabase
      .from('listings')
      .insert([
        {
          id: 'first-listing-' + Date.now(),
          title: 'Sample Listing',
          description: 'This is a sample listing',
          price: 100,
          status: 'active',
          created_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (listingError) {
      console.log('Error creating listings table:', listingError);
      
      // If the table doesn't exist, we need to create it first
      if (listingError.code === '42P01') {
        console.log('Listings table does not exist, creating it...');
        
        // Try to create the table directly
        const createListingsTableResult = await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE public.listings (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id UUID REFERENCES public.users(id),
              category_id UUID REFERENCES public.categories(id),
              title TEXT NOT NULL,
              description TEXT,
              price DECIMAL(10,2) NOT NULL,
              location TEXT,
              is_featured BOOLEAN DEFAULT false,
              status TEXT NOT NULL DEFAULT 'active',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
          `
        });
        
        if (createListingsTableResult.error) {
          console.log('Error creating listings table with SQL:', createListingsTableResult.error);
        } else {
          console.log('Successfully created listings table with SQL');
          
          // Try inserting the sample listing again
          const { data: retryListingData, error: retryListingError } = await supabase
            .from('listings')
            .insert([
              {
                id: 'first-listing-' + Date.now(),
                title: 'Sample Listing',
                description: 'This is a sample listing',
                price: 100,
                status: 'active',
                created_at: new Date().toISOString()
              }
            ])
            .select();
          
          if (retryListingError) {
            console.log('Error inserting sample listing after table creation:', retryListingError);
          } else {
            console.log('Successfully inserted sample listing after table creation:', retryListingData);
          }
        }
      }
    } else {
      console.log('Successfully created listings table and inserted sample listing:', listingData);
    }
    
    // Create other tables as needed (payments, plans, settings, notifications, support)
    // Similar pattern as above
    
    // 3. Verify the database setup
    console.log('\n--- VERIFYING DATABASE SETUP ---');
    try {
      // Check users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*');
      
      if (usersError) {
        console.log('Error verifying users:', usersError);
      } else {
        console.log(`Found ${users.length} users in the database`);
        if (users.length > 0) {
          console.log('User table structure:', Object.keys(users[0]));
        }
      }
      
      // Check categories
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*');
      
      if (categoriesError) {
        console.log('Error verifying categories:', categoriesError);
      } else {
        console.log(`Found ${categories.length} categories in the database`);
        if (categories.length > 0) {
          console.log('Category table structure:', Object.keys(categories[0]));
        }
      }
      
      // Check listings
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('*');
      
      if (listingsError) {
        console.log('Error verifying listings:', listingsError);
      } else {
        console.log(`Found ${listings.length} listings in the database`);
        if (listings.length > 0) {
          console.log('Listing table structure:', Object.keys(listings[0]));
        }
      }
    } catch (err) {
      console.error('Error during verification:', err);
    }
    
    console.log('\nDatabase recreation completed!');
    
  } catch (err) {
    console.error('Unexpected error during database recreation:', err);
  }
}

recreateDatabase();
