// Test script to verify slug auto-update when category name changes
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// You'll need to provide your Supabase URL and service key for testing
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SUPABASE_SERVICE_KEY';

// Create Supabase client with service key for testing
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testSlugUpdate() {
  console.log('🧪 Testing automatic slug update when category name changes...\n');
  
  try {
    // Step 1: Create a test category
    console.log('1️⃣ Creating test category...');
    const testCategoryId = uuidv4();
    const originalName = 'Test Category Original';
    const originalSlug = 'test-category-original';
    
    const { data: createdCategory, error: createError } = await supabase
      .from('categories')
      .insert([{
        id: testCategoryId,
        name: originalName,
        slug: originalSlug,
        description: 'Test category for slug update testing',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create test category: ${createError.message}`);
    }

    console.log(`✅ Created category: "${createdCategory.name}" with slug: "${createdCategory.slug}"`);

    // Step 2: Update the category name (this should auto-update the slug)
    console.log('\n2️⃣ Updating category name...');
    const newName = 'Updated Category Name';
    const expectedSlug = 'updated-category-name';
    
    const { data: updatedCategory, error: updateError } = await supabase
      .from('categories')
      .update({
        name: newName,
        updated_at: new Date().toISOString()
      })
      .eq('id', testCategoryId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update category: ${updateError.message}`);
    }

    console.log(`✅ Updated category name to: "${updatedCategory.name}"`);
    console.log(`📝 Slug updated to: "${updatedCategory.slug}"`);

    // Step 3: Verify the slug was updated correctly
    console.log('\n3️⃣ Verifying slug update...');
    if (updatedCategory.slug === expectedSlug) {
      console.log('✅ SUCCESS: Slug was automatically updated correctly!');
      console.log(`   Expected: "${expectedSlug}"`);
      console.log(`   Actual:   "${updatedCategory.slug}"`);
    } else {
      console.log('❌ FAILURE: Slug was not updated correctly!');
      console.log(`   Expected: "${expectedSlug}"`);
      console.log(`   Actual:   "${updatedCategory.slug}"`);
    }

    // Step 4: Clean up - delete the test category
    console.log('\n4️⃣ Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', testCategoryId);

    if (deleteError) {
      console.log(`⚠️  Warning: Failed to delete test category: ${deleteError.message}`);
    } else {
      console.log('✅ Test category deleted successfully');
    }

    return {
      success: updatedCategory.slug === expectedSlug,
      originalName,
      originalSlug,
      newName,
      expectedSlug,
      actualSlug: updatedCategory.slug
    };

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return { success: false, error: error.message };
  }
}

// Run the test
testSlugUpdate()
  .then(result => {
    console.log('\n' + '='.repeat(50));
    console.log('TEST RESULT SUMMARY');
    console.log('='.repeat(50));
    
    if (result.success) {
      console.log('🎉 TEST PASSED: Slug auto-update is working correctly!');
    } else {
      console.log('💥 TEST FAILED: Slug auto-update is not working');
      if (result.error) {
        console.log('Error:', result.error);
      }
    }
    
    console.log('='.repeat(50));
  })
  .catch(err => {
    console.error('💥 Test execution failed:', err);
  });
