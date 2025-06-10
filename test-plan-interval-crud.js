const supabase = require('./backend/config/supabase');

async function testPlanIntervalCRUD() {
  console.log('Testing Plan CRUD operations with interval field...\n');

  try {
    // Test 1: Create a new plan with interval
    console.log('1. Creating a new plan with quarterly interval...');
    const newPlan = {
      name: 'Test Quarterly Plan',
      description: 'A test plan with quarterly billing',
      price: 49.99,
      interval: 'quarterly',
      features: JSON.stringify(['Feature 1', 'Feature 2', 'Feature 3']),
      status: 'active'
    };

    const { data: createdPlan, error: createError } = await supabase
      .from('plans')
      .insert([newPlan])
      .select()
      .single();

    if (createError) {
      console.error('Error creating plan:', createError);
      return;
    }

    console.log('✅ Plan created successfully:', createdPlan);
    const planId = createdPlan.id;

    // Test 2: Read the plan
    console.log('\n2. Reading the created plan...');
    const { data: readPlan, error: readError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (readError) {
      console.error('Error reading plan:', readError);
      return;
    }

    console.log('✅ Plan read successfully:', readPlan);

    // Test 3: Update the plan interval
    console.log('\n3. Updating plan interval to yearly...');
    const { data: updatedPlan, error: updateError } = await supabase
      .from('plans')
      .update({ 
        interval: 'yearly',
        price: 199.99,
        description: 'Updated to yearly billing'
      })
      .eq('id', planId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating plan:', updateError);
      return;
    }

    console.log('✅ Plan updated successfully:', updatedPlan);

    // Test 4: Test invalid interval
    console.log('\n4. Testing invalid interval (should fail)...');
    const { data: invalidPlan, error: invalidError } = await supabase
      .from('plans')
      .update({ interval: 'invalid-interval' })
      .eq('id', planId)
      .select();

    if (invalidError) {
      console.log('✅ Invalid interval correctly rejected:', invalidError.message);
    } else {
      console.log('❌ Invalid interval was accepted (this should not happen)');
    }

    // Test 5: Filter plans by interval
    console.log('\n5. Filtering plans by interval...');
    const { data: yearlyPlans, error: filterError } = await supabase
      .from('plans')
      .select('*')
      .eq('interval', 'yearly');

    if (filterError) {
      console.error('Error filtering plans:', filterError);
      return;
    }

    console.log('✅ Yearly plans found:', yearlyPlans.length);
    yearlyPlans.forEach(plan => {
      console.log(`  - ${plan.name}: ${plan.interval} (${plan.price})`);
    });

    // Test 6: Get all plans with different intervals
    console.log('\n6. Getting all plans grouped by interval...');
    const { data: allPlans, error: allError } = await supabase
      .from('plans')
      .select('name, price, interval, status')
      .order('interval', { ascending: true });

    if (allError) {
      console.error('Error getting all plans:', allError);
      return;
    }

    const plansByInterval = allPlans.reduce((acc, plan) => {
      if (!acc[plan.interval]) {
        acc[plan.interval] = [];
      }
      acc[plan.interval].push(plan);
      return acc;
    }, {});

    console.log('✅ Plans grouped by interval:');
    Object.keys(plansByInterval).forEach(interval => {
      console.log(`  ${interval}: ${plansByInterval[interval].length} plans`);
      plansByInterval[interval].forEach(plan => {
        console.log(`    - ${plan.name}: $${plan.price} (${plan.status})`);
      });
    });

    // Test 7: Clean up - delete the test plan
    console.log('\n7. Cleaning up - deleting test plan...');
    const { error: deleteError } = await supabase
      .from('plans')
      .delete()
      .eq('id', planId);

    if (deleteError) {
      console.error('Error deleting plan:', deleteError);
      return;
    }

    console.log('✅ Test plan deleted successfully');

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('Unexpected error during testing:', error);
  }
}

// Run the tests
testPlanIntervalCRUD();
