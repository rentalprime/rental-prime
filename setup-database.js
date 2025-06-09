const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client with the provided credentials
const supabaseUrl = 'https://iqctarumnxsxyqkzxfkz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY3RhcnVtbnhzeHlxa3p4Zmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDc4MTAsImV4cCI6MjA2MjUyMzgxMH0.QvlZGTAHi1T3DThSbgkWIHvj_w7l6wqW25xIPdXZ8xc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupDatabase() {
  try {
    console.log('Starting database setup...');
    
    // 1. Set up users table with proper data
    console.log('\n--- SETTING UP USERS TABLE ---');
    try {
      // Create a super admin user
      const { data: adminUser, error: adminError } = await supabase
        .from('users')
        .insert([{
          username: 'superadmin',
          email: 'admin@rentalprimasuperadmin.com',
          password_hash: '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // This is a placeholder hash
          first_name: 'Super',
          last_name: 'Admin',
          role: 'superadmin',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();
      
      if (adminError) {
        console.log('Error creating admin user:', adminError);
      } else {
        console.log('Successfully created admin user:', adminUser);
      }
      
      // Create a regular user
      const { data: regularUser, error: regularError } = await supabase
        .from('users')
        .insert([{
          username: 'user',
          email: 'user@example.com',
          password_hash: '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // This is a placeholder hash
          first_name: 'Regular',
          last_name: 'User',
          role: 'user',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();
      
      if (regularError) {
        console.log('Error creating regular user:', regularError);
      } else {
        console.log('Successfully created regular user:', regularUser);
      }
    } catch (err) {
      console.error('Error setting up users table:', err);
    }
    
    // 2. Set up categories table
    console.log('\n--- SETTING UP CATEGORIES TABLE ---');
    try {
      // Create some sample categories
      const categories = [
        {
          name: 'Apartments',
          description: 'Apartment rentals including flats and condos',
          is_active: true
        },
        {
          name: 'Houses',
          description: 'Full house rentals including villas and cottages',
          is_active: true
        },
        {
          name: 'Commercial',
          description: 'Commercial properties for business use',
          is_active: true
        }
      ];
      
      for (const category of categories) {
        const { data, error } = await supabase
          .from('categories')
          .insert([category])
          .select();
        
        if (error) {
          console.log(`Error creating category "${category.name}":`, error);
        } else {
          console.log(`Successfully created category "${category.name}":`, data);
        }
      }
    } catch (err) {
      console.error('Error setting up categories table:', err);
    }
    
    // 3. Create and set up listings table if it doesn't exist
    console.log('\n--- SETTING UP LISTINGS TABLE ---');
    try {
      // First check if the listings table exists
      const { data: listingsCheck, error: checkError } = await supabase
        .from('listings')
        .select('*')
        .limit(1);
      
      if (checkError && checkError.code === '42P01') {
        console.log('Listings table does not exist, it needs to be created in the Supabase dashboard');
        console.log('Please create a listings table with the following structure:');
        console.log(`
          CREATE TABLE public.listings (
            listing_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES public.users(id),
            category_id UUID REFERENCES public.categories(category_id),
            title TEXT NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            location TEXT,
            is_featured BOOLEAN DEFAULT false,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);
      } else {
        // Try to insert a sample listing
        const { data: listing, error: listingError } = await supabase
          .from('listings')
          .insert([{
            title: 'Sample Apartment in Downtown',
            description: 'A beautiful apartment in the heart of the city',
            price: 1200.00,
            location: 'Downtown',
            is_featured: true,
            is_active: true
          }])
          .select();
        
        if (listingError) {
          console.log('Error creating sample listing:', listingError);
        } else {
          console.log('Successfully created sample listing:', listing);
        }
      }
    } catch (err) {
      console.error('Error setting up listings table:', err);
    }
    
    // 4. Verify the database setup
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
      }
      
      // Check categories
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*');
      
      if (categoriesError) {
        console.log('Error verifying categories:', categoriesError);
      } else {
        console.log(`Found ${categories.length} categories in the database`);
      }
      
      // Check listings
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('*');
      
      if (listingsError) {
        console.log('Error verifying listings:', listingsError);
      } else {
        console.log(`Found ${listings.length} listings in the database`);
      }
    } catch (err) {
      console.error('Error during verification:', err);
    }
    
    console.log('\nDatabase setup completed!');
    
  } catch (err) {
    console.error('Unexpected error during database setup:', err);
  }
}

setupDatabase();
