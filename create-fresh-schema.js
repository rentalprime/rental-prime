const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client with the provided credentials
const supabaseUrl = 'https://iqctarumnxsxyqkzxfkz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY3RhcnVtbnhzeHlxa3p4Zmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDc4MTAsImV4cCI6MjA2MjUyMzgxMH0.QvlZGTAHi1T3DThSbgkWIHvj_w7l6wqW25xIPdXZ8xc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Main function to create a fresh schema
async function createFreshSchema() {
  try {
    console.log('Starting fresh schema creation...');
    
    // 1. Create users table
    console.log('\nCreating users table...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
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
        console.log('Users table does not exist, creating it through SQL in Supabase dashboard...');
        console.log('Please execute the following SQL in your Supabase dashboard:');
        console.log(`
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
        `);
      }
    } else {
      console.log('Successfully created users table and inserted admin user:', userData);
    }
    
    // 2. Create categories table
    console.log('\nCreating categories table...');
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .insert([
        {
          name: 'Apartments',
          description: 'Apartment rentals including flats and condos',
          status: 'active',
          created_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (categoryError) {
      console.log('Error creating categories table:', categoryError);
      
      // If the table doesn't exist, we need to create it first
      if (categoryError.code === '42P01') {
        console.log('Categories table does not exist, creating it through SQL in Supabase dashboard...');
        console.log('Please execute the following SQL in your Supabase dashboard:');
        console.log(`
          CREATE TABLE public.categories (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            description TEXT,
            image_url TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);
      }
    } else {
      console.log('Successfully created categories table and inserted sample category:', categoryData);
    }
    
    // 3. Create listings table
    console.log('\nCreating listings table...');
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
      console.log('Error creating listings table:', listingError);
      
      // If the table doesn't exist, we need to create it first
      if (listingError.code === '42P01') {
        console.log('Listings table does not exist, creating it through SQL in Supabase dashboard...');
        console.log('Please execute the following SQL in your Supabase dashboard:');
        console.log(`
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
        `);
      }
    } else {
      console.log('Successfully created listings table and inserted sample listing:', listingData);
    }
    
    // 4. Create payments table
    console.log('\nCreating payments table...');
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert([
        {
          amount: 100,
          status: 'completed',
          created_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (paymentError) {
      console.log('Error creating payments table:', paymentError);
      
      // If the table doesn't exist, we need to create it first
      if (paymentError.code === '42P01') {
        console.log('Payments table does not exist, creating it through SQL in Supabase dashboard...');
        console.log('Please execute the following SQL in your Supabase dashboard:');
        console.log(`
          CREATE TABLE public.payments (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES public.users(id),
            listing_id UUID REFERENCES public.listings(id),
            amount DECIMAL(10,2) NOT NULL,
            payment_method TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);
      }
    } else {
      console.log('Successfully created payments table and inserted sample payment:', paymentData);
    }
    
    // 5. Create plans table
    console.log('\nCreating plans table...');
    const { data: planData, error: planError } = await supabase
      .from('plans')
      .insert([
        {
          name: 'Basic Plan',
          description: 'Basic features for small businesses',
          price: 9.99,
          status: 'active',
          created_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (planError) {
      console.log('Error creating plans table:', planError);
      
      // If the table doesn't exist, we need to create it first
      if (planError.code === '42P01') {
        console.log('Plans table does not exist, creating it through SQL in Supabase dashboard...');
        console.log('Please execute the following SQL in your Supabase dashboard:');
        console.log(`
          CREATE TABLE public.plans (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            features JSONB,
            status TEXT NOT NULL DEFAULT 'active',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);
      }
    } else {
      console.log('Successfully created plans table and inserted sample plan:', planData);
    }
    
    // 6. Create settings table
    console.log('\nCreating settings table...');
    const { data: settingData, error: settingError } = await supabase
      .from('settings')
      .insert([
        {
          key: 'site_name',
          value: 'Rental Prima',
          created_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (settingError) {
      console.log('Error creating settings table:', settingError);
      
      // If the table doesn't exist, we need to create it first
      if (settingError.code === '42P01') {
        console.log('Settings table does not exist, creating it through SQL in Supabase dashboard...');
        console.log('Please execute the following SQL in your Supabase dashboard:');
        console.log(`
          CREATE TABLE public.settings (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            key TEXT UNIQUE NOT NULL,
            value TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);
      }
    } else {
      console.log('Successfully created settings table and inserted sample setting:', settingData);
    }
    
    // 7. Create notifications table
    console.log('\nCreating notifications table...');
    const { data: notificationData, error: notificationError } = await supabase
      .from('notifications')
      .insert([
        {
          title: 'Welcome to Rental Prima',
          message: 'Thank you for joining our platform!',
          status: 'unread',
          created_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (notificationError) {
      console.log('Error creating notifications table:', notificationError);
      
      // If the table doesn't exist, we need to create it first
      if (notificationError.code === '42P01') {
        console.log('Notifications table does not exist, creating it through SQL in Supabase dashboard...');
        console.log('Please execute the following SQL in your Supabase dashboard:');
        console.log(`
          CREATE TABLE public.notifications (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES public.users(id),
            title TEXT NOT NULL,
            message TEXT,
            status TEXT NOT NULL DEFAULT 'unread',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);
      }
    } else {
      console.log('Successfully created notifications table and inserted sample notification:', notificationData);
    }
    
    // 8. Create support table
    console.log('\nCreating support table...');
    const { data: supportData, error: supportError } = await supabase
      .from('support')
      .insert([
        {
          subject: 'Help with listing',
          message: 'I need help with creating a new listing',
          status: 'open',
          created_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (supportError) {
      console.log('Error creating support table:', supportError);
      
      // If the table doesn't exist, we need to create it first
      if (supportError.code === '42P01') {
        console.log('Support table does not exist, creating it through SQL in Supabase dashboard...');
        console.log('Please execute the following SQL in your Supabase dashboard:');
        console.log(`
          CREATE TABLE public.support (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES public.users(id),
            subject TEXT NOT NULL,
            message TEXT,
            status TEXT NOT NULL DEFAULT 'open',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);
      }
    } else {
      console.log('Successfully created support table and inserted sample support ticket:', supportData);
    }
    
    // 9. Verify the database setup
    console.log('\n--- VERIFYING DATABASE SETUP ---');
    const tables = ['users', 'categories', 'listings', 'payments', 'plans', 'settings', 'notifications', 'support'];
    
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
          }
        }
      } catch (err) {
        console.error(`Error during verification of ${table}:`, err);
      }
    }
    
    console.log('\nFresh schema creation completed!');
    
  } catch (err) {
    console.error('Unexpected error during fresh schema creation:', err);
  }
}

createFreshSchema();
