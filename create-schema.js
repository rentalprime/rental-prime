const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client with the provided credentials
const supabaseUrl = 'https://iqctarumnxsxyqkzxfkz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY3RhcnVtbnhzeHlxa3p4Zmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDc4MTAsImV4cCI6MjA2MjUyMzgxMH0.QvlZGTAHi1T3DThSbgkWIHvj_w7l6wqW25xIPdXZ8xc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupSchema() {
  try {
    console.log('Attempting to create or update tables...');
    
    // First, let's try to drop the existing users table if it exists but has wrong schema
    try {
      const { error: dropError } = await supabase.rpc('drop_table_if_exists', { table_name: 'users' });
      if (!dropError) {
        console.log('Successfully dropped existing users table');
      }
    } catch (dropErr) {
      console.log('Could not drop table, it may not exist or we lack permissions:', dropErr.message);
    }
    
    // Now let's try to create the users table with SQL
    try {
      const { error: sqlError } = await supabase.rpc('run_sql', { 
        sql: `
          CREATE TABLE IF NOT EXISTS public.users (
            id UUID PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            phone TEXT,
            status TEXT DEFAULT 'active',
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `
      });
      
      if (sqlError) {
        console.error('SQL Error:', sqlError);
      } else {
        console.log('Successfully created users table schema');
      }
    } catch (sqlErr) {
      console.log('SQL execution error:', sqlErr.message);
      console.log('Trying alternative approach...');
    }
    
    // If SQL approach fails, let's try using the Supabase API to create a test user
    // This might help us understand what columns are actually allowed
    console.log('\nTrying to insert a test user to see what columns are accepted...');
    const testUser = {
      // Try with UUID format for id
      id: '00000000-0000-0000-0000-000000000001',
      email: 'test@example.com',
      name: 'Test User',
      phone: '1234567890',
      status: 'active',
      role: 'user',
      created_at: new Date().toISOString()
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .upsert([testUser])
      .select();
      
    if (insertError) {
      console.error('Insert Error:', insertError);
      
      // Try with a simpler object to see what works
      console.log('\nTrying with minimal fields...');
      const { data: minimalData, error: minimalError } = await supabase
        .from('users')
        .insert([{ email: 'minimal@example.com' }])
        .select();
        
      if (minimalError) {
        console.error('Minimal Insert Error:', minimalError);
      } else {
        console.log('Minimal Insert Success:', minimalData);
        console.log('Accepted columns:', Object.keys(minimalData[0]));
      }
    } else {
      console.log('Insert Success:', insertData);
      console.log('Accepted columns:', Object.keys(insertData[0]));
    }
    
    // Finally, query the users table to see its current state
    console.log('\nQuerying users table to see current state...');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*');
      
    if (usersError) {
      console.error('Query Error:', usersError);
    } else {
      console.log('Users table data:', usersData);
      if (usersData && usersData.length > 0) {
        console.log('Current users table columns:', Object.keys(usersData[0]));
      } else {
        console.log('Users table exists but is empty');
      }
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

setupSchema();
