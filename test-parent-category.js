// CommonJS script to test the parent_id column in Supabase
const { createClient } = require('@supabase/supabase-js');

// You'll need to provide your Supabase URL and anon key
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testParentCategoryField() {
  console.log('Testing if parent_id field exists in categories table...');
  
  try {
    // Try to fetch the categories table schema
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying database:', error);
      return { success: false, error };
    }
    
    console.log('Query result:', data);
    
    // Check if parent_id is present in the returned data structure or columns
    if (data && data.length > 0) {
      const firstCategory = data[0];
      const hasParentIdField = 'parent_id' in firstCategory;
      
      console.log('parent_id field exists:', hasParentIdField);
      return { 
        success: true, 
        hasParentIdField,
        message: hasParentIdField 
          ? 'Success! The parent_id field exists in the categories table!' 
          : 'The SQL query might not have executed successfully. The parent_id field was not found.'
      };
    } else {
      console.log('No categories found, but query was successful');
      return { 
        success: true, 
        hasParentIdField: null,
        message: 'No categories found to test, but the query executed without errors.'
      };
    }
  } catch (error) {
    console.error('Exception when testing parent_id field:', error);
    return { success: false, error };
  }
}

// Run the test
testParentCategoryField()
  .then(result => {
    console.log('\nTest Result:');
    console.log('----------------------------------');
    console.log(result.message);
    console.log('----------------------------------');
    
    if (!result.success) {
      console.log('Error details:', result.error);
    }
  })
  .catch(err => {
    console.error('Test failed with error:', err);
  });
