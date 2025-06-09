const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client with the provided credentials
const supabaseUrl = 'https://iqctarumnxsxyqkzxfkz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY3RhcnVtbnhzeHlxa3p4Zmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDc4MTAsImV4cCI6MjA2MjUyMzgxMH0.QvlZGTAHi1T3DThSbgkWIHvj_w7l6wqW25xIPdXZ8xc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listTables() {
  try {
    // Query the information_schema to get a list of tables
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (error) {
      console.error('Error listing tables:', error);
      
      // Alternative approach if the above fails
      console.log('\nTrying alternative approach...');
      const { data: tablesData, error: tablesError } = await supabase.rpc('list_tables');
      
      if (tablesError) {
        console.error('Alternative approach error:', tablesError);
      } else {
        console.log('Tables:', tablesData);
      }
    } else {
      console.log('Tables:', data);
    }
    
    // Try to query the users table to see its structure
    console.log('\nAttempting to query users table...');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
      
    if (usersError) {
      console.error('Error querying users table:', usersError);
    } else {
      console.log('Users table first row:', usersData);
      if (usersData && usersData.length > 0) {
        console.log('Users table columns:', Object.keys(usersData[0]));
      } else {
        console.log('Users table exists but is empty');
      }
    }
    
    // Try to query the auth.users table which might be where user data is stored
    console.log('\nAttempting to query auth.users table...');
    const { data: authUsersData, error: authUsersError } = await supabase
      .from('auth.users')
      .select('*')
      .limit(1);
      
    if (authUsersError) {
      console.error('Error querying auth.users table:', authUsersError);
    } else {
      console.log('Auth.users table first row:', authUsersData);
      if (authUsersData && authUsersData.length > 0) {
        console.log('Auth.users table columns:', Object.keys(authUsersData[0]));
      } else {
        console.log('Auth.users table exists but is empty');
      }
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

listTables();
