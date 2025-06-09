const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Initialize Supabase client
const supabaseUrl = 'https://vmwjqwgvzmwjomcehabe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtd2pxd2d2em13am9tY2VoYWJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg5ODI4NiwiZXhwIjoyMDYzNDc0Mjg2fQ.H1YMO_Tye6ikWth7csEwPMWI3CxYcQaQ6N6oNXwf-0c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCategoryCRUD() {
  console.log('🧪 Testing Category CRUD Operations...\n');

  try {
    // Test 1: Create a root category
    console.log('1️⃣ Creating root category...');
    const rootCategoryId = uuidv4();
    const rootCategory = {
      id: rootCategoryId,
      name: 'Electronics',
      description: 'Electronic devices and gadgets',
      slug: 'electronics',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: createdRoot, error: createRootError } = await supabase
      .from('categories')
      .insert([rootCategory])
      .select()
      .single();

    if (createRootError) {
      throw new Error(`Failed to create root category: ${createRootError.message}`);
    }

    console.log('✅ Root category created:', createdRoot.name);

    // Test 2: Create a subcategory
    console.log('\n2️⃣ Creating subcategory...');
    const subCategoryId = uuidv4();
    const subCategory = {
      id: subCategoryId,
      name: 'Smartphones',
      description: 'Mobile phones and smartphones',
      slug: 'smartphones',
      status: 'active',
      parent_id: rootCategoryId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: createdSub, error: createSubError } = await supabase
      .from('categories')
      .insert([subCategory])
      .select()
      .single();

    if (createSubError) {
      throw new Error(`Failed to create subcategory: ${createSubError.message}`);
    }

    console.log('✅ Subcategory created:', createdSub.name);

    // Test 3: Read categories with hierarchy
    console.log('\n3️⃣ Reading categories with hierarchy...');
    const { data: categories, error: readError } = await supabase
      .from('categories')
      .select(`
        *,
        parent:parent_id(id, name, slug),
        children:categories!parent_id(id, name, slug, status)
      `)
      .in('id', [rootCategoryId, subCategoryId]);

    if (readError) {
      throw new Error(`Failed to read categories: ${readError.message}`);
    }

    console.log('✅ Categories retrieved:');
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.children?.length || 0} children)`);
    });

    // Test 4: Update category
    console.log('\n4️⃣ Updating category...');
    const { data: updatedCategory, error: updateError } = await supabase
      .from('categories')
      .update({
        description: 'Updated: Electronic devices, gadgets and accessories',
        updated_at: new Date().toISOString()
      })
      .eq('id', rootCategoryId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update category: ${updateError.message}`);
    }

    console.log('✅ Category updated:', updatedCategory.description);

    // Test 5: Search categories
    console.log('\n5️⃣ Searching categories...');
    const { data: searchResults, error: searchError } = await supabase
      .from('categories')
      .select('*')
      .or('name.ilike.%phone%,description.ilike.%phone%');

    if (searchError) {
      throw new Error(`Failed to search categories: ${searchError.message}`);
    }

    console.log('✅ Search results for "phone":', searchResults.length, 'found');

    // Test 6: Get category by slug
    console.log('\n6️⃣ Getting category by slug...');
    const { data: categoryBySlug, error: slugError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', 'electronics')
      .single();

    if (slugError) {
      throw new Error(`Failed to get category by slug: ${slugError.message}`);
    }

    console.log('✅ Category found by slug:', categoryBySlug.name);

    // Test 7: Delete subcategory first
    console.log('\n7️⃣ Deleting subcategory...');
    const { error: deleteSubError } = await supabase
      .from('categories')
      .delete()
      .eq('id', subCategoryId);

    if (deleteSubError) {
      throw new Error(`Failed to delete subcategory: ${deleteSubError.message}`);
    }

    console.log('✅ Subcategory deleted');

    // Test 8: Delete root category
    console.log('\n8️⃣ Deleting root category...');
    const { error: deleteRootError } = await supabase
      .from('categories')
      .delete()
      .eq('id', rootCategoryId);

    if (deleteRootError) {
      throw new Error(`Failed to delete root category: ${deleteRootError.message}`);
    }

    console.log('✅ Root category deleted');

    console.log('\n🎉 All CRUD tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Cleanup: Try to delete test categories if they exist
    console.log('\n🧹 Cleaning up test data...');
    try {
      await supabase.from('categories').delete().ilike('name', '%Electronics%');
      await supabase.from('categories').delete().ilike('name', '%Smartphones%');
      console.log('✅ Cleanup completed');
    } catch (cleanupError) {
      console.log('⚠️ Cleanup failed:', cleanupError.message);
    }
  }
}

// Run the test
if (require.main === module) {
  testCategoryCRUD();
}

module.exports = { testCategoryCRUD };
