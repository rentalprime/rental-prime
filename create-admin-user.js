// Script to create an admin user in Supabase
const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client with the provided credentials
const supabaseUrl = 'https://iqctarumnxsxyqkzxfkz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY3RhcnVtbnhzeHlxa3p4Zmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDc4MTAsImV4cCI6MjA2MjUyMzgxMH0.QvlZGTAHi1T3DThSbgkWIHvj_w7l6wqW25xIPdXZ8xc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const createAdmin = async () => {
  const email = 'admin@gmail.com';
  const password = 'password123';
  
  try {
    // 1. Create the user in Supabase Auth
    console.log(`Creating admin user with email: ${email}...`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) {
      console.error('Error creating user in Auth:', authError.message);
      return;
    }
    
    console.log('User created in Auth:', authData.user.id);
    
    // 2. Create the user profile in the users table
    if (authData.user) {
      // First, check if the users table exists
      const { error: tableCheckError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (tableCheckError) {
        console.log('Users table does not exist yet. Creating it...');
        // Table doesn't exist, we need to create it first
        // Note: This is simplified and may not work in all Supabase instances
        // Typically you would use migrations or the Supabase dashboard to create tables
        console.log('Please create a "users" table in your Supabase dashboard with the following columns:');
        console.log('- id (uuid, primary key)');
        console.log('- email (text)');
        console.log('- name (text)');
        console.log('- role (text)');
        console.log('- status (text)');
        console.log('- created_at (timestamp)');
        return;
      }
      
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert([{
          user_id: authData.user.id,
          email: email,
          name: 'Admin User',
          role: 'superadmin',
          status: 'active',
          created_at: new Date().toISOString()
        }])
        .select();
      
      if (profileError) {
        console.error('Error creating user profile:', profileError.message);
        return;
      }
      
      console.log('Admin user created successfully!');
      console.log('User Profile:', profileData[0]);
    }
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  }
};

// Execute the function
createAdmin().then(() => {
  console.log('Script execution completed');
}).catch(err => {
  console.error('Unhandled error:', err);
});
