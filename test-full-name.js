const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client with the provided credentials
const supabaseUrl = 'https://iqctarumnxsxyqkzxfkz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY3RhcnVtbnhzeHlxa3p4Zmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDc4MTAsImV4cCI6MjA2MjUyMzgxMH0.QvlZGTAHi1T3DThSbgkWIHvj_w7l6wqW25xIPdXZ8xc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFullName() {
  try {
    console.log('Testing full name field usage...');
    
    // Test 1: Try using only full_name field
    const testUser1 = {
      username: 'fullname_test_' + Date.now(),
      email: `fullname_test_${Date.now()}@example.com`,
      password_hash: 'test-password-hash',
      full_name: 'Full Name Test',
      role: 'admin',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('\nTest 1: Using only full_name field');
    const { data: data1, error: error1 } = await supabase
      .from('users')
      .insert([testUser1])
      .select();
    
    if (error1) {
      console.log('Error with full_name only:', error1);
      
      // Test 2: Try using first_name for full name and empty last_name
      const testUser2 = {
        username: 'fullname_test2_' + Date.now(),
        email: `fullname_test2_${Date.now()}@example.com`,
        password_hash: 'test-password-hash',
        first_name: 'Full Name Test',
        last_name: ' ', // Empty but not null
        role: 'admin',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('\nTest 2: Using first_name for full name and empty last_name');
      const { data: data2, error: error2 } = await supabase
        .from('users')
        .insert([testUser2])
        .select();
      
      if (error2) {
        console.log('Error with first_name for full name:', error2);
      } else {
        console.log('Success with first_name for full name!');
        console.log('User created:', data2[0]);
      }
      
      // Test 3: Try using first_name and placeholder last_name
      const testUser3 = {
        username: 'fullname_test3_' + Date.now(),
        email: `fullname_test3_${Date.now()}@example.com`,
        password_hash: 'test-password-hash',
        first_name: 'Full Name',
        last_name: 'Test',
        role: 'admin',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('\nTest 3: Using first_name and last_name properly');
      const { data: data3, error: error3 } = await supabase
        .from('users')
        .insert([testUser3])
        .select();
      
      if (error3) {
        console.log('Error with proper first_name and last_name:', error3);
      } else {
        console.log('Success with proper first_name and last_name!');
        console.log('User created:', data3[0]);
      }
    } else {
      console.log('Success with full_name only!');
      console.log('User created:', data1[0]);
    }
    
    // Check if we can update a user's role
    console.log('\nTesting role update capability...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError || !users || users.length === 0) {
      console.log('Error fetching users or no users found:', usersError);
    } else {
      const testUser = users[0];
      console.log('Found user to update:', testUser);
      
      // Try to update the role
      const newRole = testUser.role === 'admin' ? 'customer' : 'admin';
      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('user_id', testUser.user_id)
        .select();
      
      if (updateError) {
        console.log('Error updating role:', updateError);
      } else {
        console.log('Successfully updated role!');
        console.log('Updated user:', updateData[0]);
      }
    }
    
    console.log('\nFull name testing completed!');
    
  } catch (err) {
    console.error('Unexpected error during full name testing:', err);
  }
}

testFullName();
