const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client with the provided credentials
const supabaseUrl = 'https://iqctarumnxsxyqkzxfkz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY3RhcnVtbnhzeHlxa3p4Zmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDc4MTAsImV4cCI6MjA2MjUyMzgxMH0.QvlZGTAHi1T3DThSbgkWIHvj_w7l6wqW25xIPdXZ8xc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRoleValues() {
  try {
    console.log('Testing different role values to determine which ones are allowed...');
    
    // Common role values to test
    const rolesToTest = [
      'superadmin',
      'admin',
      'user',
      'customer',
      'client',
      'manager',
      'editor',
      'viewer',
      'moderator'
    ];
    
    const baseUser = {
      username: 'roletest',
      email: 'roletest@example.com',
      password_hash: 'test-password-hash',
      first_name: 'Role',
      last_name: 'Test',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Test each role value
    for (const role of rolesToTest) {
      const testUser = { 
        ...baseUser,
        username: `roletest_${role}_${Date.now()}`,
        email: `roletest_${role}_${Date.now()}@example.com`,
        role
      };
      
      console.log(`\nTesting role value: "${role}"`);
      const { data, error } = await supabase
        .from('users')
        .insert([testUser])
        .select();
      
      if (error) {
        console.log(`Error with role "${role}":`, error);
        console.log(`Conclusion: "${role}" is NOT an allowed value`);
      } else {
        console.log(`Success with role "${role}"`);
        console.log(`Conclusion: "${role}" IS an allowed value`);
        console.log('Created user:', data[0]);
        
        // Clean up by deleting the test user
        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .eq('id', data[0].id);
        
        if (deleteError) {
          console.log(`Error deleting test user with role "${role}":`, deleteError);
        } else {
          console.log(`Successfully deleted test user with role "${role}"`);
        }
      }
    }
    
    console.log('\nRole value testing completed!');
    
  } catch (err) {
    console.error('Unexpected error during role value testing:', err);
  }
}

checkRoleValues();
