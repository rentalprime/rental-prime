const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client with the provided credentials
const supabaseUrl = 'https://iqctarumnxsxyqkzxfkz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY3RhcnVtbnhzeHlxa3p4Zmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDc4MTAsImV4cCI6MjA2MjUyMzgxMH0.QvlZGTAHi1T3DThSbgkWIHvj_w7l6wqW25xIPdXZ8xc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectUsersTable() {
  try {
    console.log('Inspecting users table structure...');
    
    // Try to get the structure of the users table by creating a minimal record
    try {
      // First attempt with minimal fields to see what's required
      const { data: minimalUser, error: minimalError } = await supabase
        .from('users')
        .insert([{ 
          email: 'test-minimal@example.com',
          first_name: 'Test',
          last_name: 'User',
          password_hash: 'test-password-hash'
        }])
        .select();
      
      if (minimalError) {
        console.log('Minimal insert error:', minimalError);
        
        // Try with even fewer fields
        const { data: basicUser, error: basicError } = await supabase
          .from('users')
          .insert([{ 
            email: 'test-basic@example.com',
            first_name: 'Basic',
            last_name: 'User'
          }])
          .select();
        
        if (basicError) {
          console.log('Basic insert error:', basicError);
        } else {
          console.log('Successfully inserted basic user');
          console.log('User structure:', Object.keys(basicUser[0]));
          console.log('User data:', basicUser[0]);
        }
      } else {
        console.log('Successfully inserted minimal user');
        console.log('User structure:', Object.keys(minimalUser[0]));
        console.log('User data:', minimalUser[0]);
      }
    } catch (err) {
      console.error('Error during users table insert test:', err);
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
          
          // Try to get column information through metadata
          const { data: columns, error: columnsError } = await supabase
            .rpc('get_columns', { table_name: 'users' });
          
          if (columnsError) {
            console.log('Error getting columns metadata:', columnsError);
          } else {
            console.log('Columns metadata:', columns);
          }
        }
      }
    } catch (err) {
      console.error('Error querying users table:', err);
    }
    
    console.log('\nUsers table inspection completed!');
    
  } catch (err) {
    console.error('Unexpected error during users table inspection:', err);
  }
}

inspectUsersTable();
