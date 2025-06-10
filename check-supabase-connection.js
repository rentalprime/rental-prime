const { createClient } = require("@supabase/supabase-js");

// Initialize the Supabase client with the provided credentials
const supabaseUrl = "https://vmwjqwgvzmwjomcehabe.supabase.co";
const supabase_service_role =
  process.env.SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtd2pxd2d2em13am9tY2VoYWJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg5ODI4NiwiZXhwIjoyMDYzNDc0Mjg2fQ.H1YMO_Tye6ikWth7csEwPMWI3CxYcQaQ6N6oNXwf-0c";

const supabase = createClient(supabaseUrl, supabase_service_role);

async function checkConnection() {
  try {
    console.log("🔍 Checking Supabase connection...");
    console.log("URL:", supabaseUrl);
    
    // Test connection by trying to fetch from users table
    const { data, error } = await supabase
      .from("users")
      .select("id, name")
      .limit(1);
    
    if (error) {
      console.error("❌ Connection failed:", error);
      return false;
    }
    
    console.log("✅ Connection successful!");
    console.log("Sample data:", data);
    
    // Check if user_subscriptions table exists
    console.log("\n🔍 Checking if user_subscriptions table exists...");
    const { data: subData, error: subError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .limit(1);
    
    if (subError) {
      console.log("❌ user_subscriptions table does not exist");
      console.log("Error:", subError.message);
      console.log("\n📋 To create the table, please:");
      console.log("1. Go to your Supabase dashboard");
      console.log("2. Navigate to SQL Editor");
      console.log("3. Run the SQL from database/create_user_subscriptions_table.sql");
      return false;
    } else {
      console.log("✅ user_subscriptions table exists!");
      console.log("Sample data:", subData);
      return true;
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
    return false;
  }
}

checkConnection()
  .then((success) => {
    if (success) {
      console.log("\n🎉 All checks passed!");
    } else {
      console.log("\n⚠️  Some issues found - see above for instructions");
    }
  })
  .catch((error) => {
    console.error("❌ Check failed:", error);
  });
