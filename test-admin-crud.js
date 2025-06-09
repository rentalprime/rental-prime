const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "https://vmwjqwgvzmwjomcehabe.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtd2pxd2d2em13am9tY2VoYWJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg5ODI4NiwiZXhwIjoyMDYzNDc0Mjg2fQ.H1YMO_Tye6ikWth7csEwPMWI3CxYcQaQ6N6oNXwf-0c";
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminCRUD() {
  console.log("🚀 Testing Admin CRUD Operations...\n");

  try {
    // 1. Test: Check if admin_users table exists
    console.log("1. Checking if admin_users table exists...");
    const { data: tableCheck, error: tableError } = await supabase
      .from("admin_users")
      .select("*")
      .limit(1);

    if (tableError) {
      console.log("❌ admin_users table does not exist or has issues:");
      console.log("Error:", tableError.message);
      console.log("\n📝 Please run the SQL script in database/admin_users_schema.sql to create the table.\n");
      return;
    }
    console.log("✅ admin_users table exists\n");

    // 2. Test: Check if roles table has required roles
    console.log("2. Checking required roles...");
    const { data: roles, error: rolesError } = await supabase
      .from("roles")
      .select("*")
      .in("name", ["super_admin", "admin", "moderator"]);

    if (rolesError) {
      console.log("❌ Error checking roles:", rolesError.message);
      return;
    }

    console.log("✅ Available roles:", roles.map(r => r.name).join(", "));
    
    if (roles.length === 0) {
      console.log("⚠️  No admin roles found. Please ensure roles are set up properly.\n");
      return;
    }

    // 3. Test: Get all admin users
    console.log("\n3. Testing GET all admin users...");
    const { data: adminUsers, error: getUsersError } = await supabase
      .from("admin_users")
      .select("*, roles(name, description)");

    if (getUsersError) {
      console.log("❌ Error getting admin users:", getUsersError.message);
    } else {
      console.log("✅ Successfully retrieved admin users:");
      console.log(`   Found ${adminUsers.length} admin user(s)`);
      adminUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - Role: ${user.roles?.name || 'No role'}`);
      });
    }

    // 4. Test: Create a new admin user
    console.log("\n4. Testing CREATE admin user...");
    const testEmail = `test-admin-${Date.now()}@example.com`;
    
    // First get a role ID
    const superAdminRole = roles.find(r => r.name === 'super_admin') || roles[0];
    
    const newAdminData = {
      name: "Test Admin User",
      email: testEmail,
      password: "test_password_123",
      user_type: "admin",
      role_id: superAdminRole.id,
      status: "active"
    };

    // Create in Supabase Auth first (simulating the controller logic)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: "test_password_123",
      email_confirm: true,
    });

    if (authError) {
      console.log("❌ Error creating auth user:", authError.message);
    } else {
      console.log("✅ Created auth user:", authData.user.id);

      // Now create in admin_users table
      const { data: adminUserData, error: createError } = await supabase
        .from("admin_users")
        .insert([{
          id: authData.user.id,
          ...newAdminData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select("*, roles(name, description)")
        .single();

      if (createError) {
        console.log("❌ Error creating admin user:", createError.message);
      } else {
        console.log("✅ Successfully created admin user:");
        console.log(`   ID: ${adminUserData.id}`);
        console.log(`   Name: ${adminUserData.name}`);
        console.log(`   Email: ${adminUserData.email}`);
        console.log(`   Role: ${adminUserData.roles?.name || 'No role'}`);

        // 5. Test: Update the admin user
        console.log("\n5. Testing UPDATE admin user...");
        const { data: updatedUser, error: updateError } = await supabase
          .from("admin_users")
          .update({
            name: "Updated Test Admin",
            status: "active",
            updated_at: new Date().toISOString()
          })
          .eq("id", adminUserData.id)
          .select("*, roles(name, description)")
          .single();

        if (updateError) {
          console.log("❌ Error updating admin user:", updateError.message);
        } else {
          console.log("✅ Successfully updated admin user:");
          console.log(`   New name: ${updatedUser.name}`);
        }

        // 6. Test: Get single admin user
        console.log("\n6. Testing GET single admin user...");
        const { data: singleUser, error: getSingleError } = await supabase
          .from("admin_users")
          .select("*, roles(name, description)")
          .eq("id", adminUserData.id)
          .single();

        if (getSingleError) {
          console.log("❌ Error getting single admin user:", getSingleError.message);
        } else {
          console.log("✅ Successfully retrieved single admin user:");
          console.log(`   Name: ${singleUser.name}`);
          console.log(`   Email: ${singleUser.email}`);
        }

        // 7. Test: Delete the admin user
        console.log("\n7. Testing DELETE admin user...");
        
        // Delete from admin_users table
        const { error: deleteError } = await supabase
          .from("admin_users")
          .delete()
          .eq("id", adminUserData.id);

        if (deleteError) {
          console.log("❌ Error deleting admin user from table:", deleteError.message);
        } else {
          console.log("✅ Successfully deleted admin user from table");
        }

        // Delete from auth
        const { error: authDeleteError } = await supabase.auth.admin.deleteUser(adminUserData.id);
        if (authDeleteError) {
          console.log("❌ Error deleting auth user:", authDeleteError.message);
        } else {
          console.log("✅ Successfully deleted auth user");
        }
      }
    }

    console.log("\n🎉 Admin CRUD testing completed!");

  } catch (error) {
    console.error("❌ Unexpected error during testing:", error.message);
  }
}

// Run the test
testAdminCRUD().then(() => {
  console.log("\n✨ Test script finished");
}).catch(err => {
  console.error("💥 Test script failed:", err);
});
