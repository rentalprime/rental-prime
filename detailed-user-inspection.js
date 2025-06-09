const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client with the provided credentials
const supabaseUrl = 'https://iqctarumnxsxyqkzxfkz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY3RhcnVtbnhzeHlxa3p4Zmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDc4MTAsImV4cCI6MjA2MjUyMzgxMH0.QvlZGTAHi1T3DThSbgkWIHvj_w7l6wqW25xIPdXZ8xc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function detailedUserInspection() {
  try {
    console.log('Starting detailed user table inspection...');
    
    // Try to insert a user with all possible fields to determine which ones are required
    const testUser = {
      username: 'testuser' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password_hash: 'test-password-hash',
      first_name: 'Test',
      last_name: 'User',
      role: 'user',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Attempting to insert a complete test user...');
    const { data: completeUser, error: completeError } = await supabase
      .from('users')
      .insert([testUser])
      .select();
    
    if (completeError) {
      console.log('Complete user insert error:', completeError);
    } else {
      console.log('Successfully inserted complete user');
      console.log('User structure:', Object.keys(completeUser[0]));
      console.log('User data:', completeUser[0]);
    }
    
    // Try to query the users table to see existing records and structure
    console.log('\nQuerying users table for existing records...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      console.log('Error querying users:', usersError);
    } else {
      console.log('Users table query successful');
      if (users.length > 0) {
        console.log('Users table columns:', Object.keys(users[0]));
        console.log('Sample users:');
        users.forEach((user, index) => {
          console.log(`User ${index + 1}:`, user);
        });
      } else {
        console.log('Users table exists but is empty');
      }
    }
    
    // Try to systematically determine required fields by omitting one at a time
    console.log('\nTesting which fields are required by omitting one at a time...');
    const fieldsToTest = [
      'username',
      'email',
      'password_hash',
      'first_name',
      'last_name',
      'role',
      'status'
    ];
    
    for (const field of fieldsToTest) {
      const testUserWithoutField = { ...testUser };
      delete testUserWithoutField[field];
      testUserWithoutField.username = 'test' + Date.now(); // Ensure unique username
      testUserWithoutField.email = `test${Date.now()}@example.com`; // Ensure unique email
      
      console.log(`\nTesting without ${field}...`);
      const { data, error } = await supabase
        .from('users')
        .insert([testUserWithoutField])
        .select();
      
      if (error) {
        console.log(`Error when omitting ${field}:`, error);
        console.log(`Conclusion: ${field} appears to be required`);
      } else {
        console.log(`Success when omitting ${field}`);
        console.log(`Conclusion: ${field} is NOT required`);
      }
    }
    
    console.log('\nDetailed user table inspection completed!');
    
  } catch (err) {
    console.error('Unexpected error during detailed user inspection:', err);
  }
}

detailedUserInspection();
