const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client with the provided credentials
const supabaseUrl = 'https://iqctarumnxsxyqkzxfkz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY3RhcnVtbnhzeHlxa3p4Zmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDc4MTAsImV4cCI6MjA2MjUyMzgxMH0.QvlZGTAHi1T3DThSbgkWIHvj_w7l6wqW25xIPdXZ8xc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  try {
    // Try to insert a record with debug info to see the exact error
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: 'test-id-' + Date.now(),
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        status: 'active',
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('Insert Error:', error);
    } else {
      console.log('Insert Success:', data);
    }

    // Try to select with specific columns to see which ones exist
    const { data: selectData, error: selectError } = await supabase
      .from('users')
      .select('id, email, role, status, created_at')
      .limit(1);

    if (selectError) {
      console.error('Select Error:', selectError);
    } else {
      console.log('Select Success (without name):', selectData);
    }

    // Try to describe the table structure using metadata
    console.log('\nAttempting to get table information from metadata...');
    const { data: tableData, error: tableError } = await supabase
      .from('_metadata')
      .select('*')
      .eq('table', 'users');

    if (tableError) {
      console.error('Metadata Error:', tableError);
    } else {
      console.log('Table Metadata:', tableData);
    }

  } catch (err) {
    console.error('Unexpected Error:', err);
  }
}

checkSchema();
