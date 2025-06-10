const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Initialize the Supabase client with the provided credentials
const supabaseUrl = "https://vmwjqwgvzmwjomcehabe.supabase.co";
const supabase_service_role =
  process.env.SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtd2pxd2d2em13am9tY2VoYWJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg5ODI4NiwiZXhwIjoyMDYzNDc0Mjg2fQ.H1YMO_Tye6ikWth7csEwPMWI3CxYcQaQ6N6oNXwf-0c";

const supabase = createClient(supabaseUrl, supabase_service_role);

async function createUserSubscriptionsTable() {
  try {
    console.log("Starting user_subscriptions table creation...");

    // Read the SQL file
    const sqlFilePath = path.join(
      __dirname,
      "database",
      "create_user_subscriptions_table.sql"
    );
    const sqlContent = fs.readFileSync(sqlFilePath, "utf8");

    // Since exec_sql might not be available, let's create the table step by step
    console.log("Creating user_subscriptions table...");

    // First, try to create the table directly using a simple insert/select approach
    // This is a workaround since we can't execute raw SQL directly
    try {
      // Try to select from the table to see if it exists
      const { data: existingTable, error: tableCheckError } = await supabase
        .from("user_subscriptions")
        .select("*")
        .limit(1);

      if (!tableCheckError) {
        console.log("✅ user_subscriptions table already exists!");
        return true;
      }

      // If we get here, the table doesn't exist
      console.log(
        "Table doesn't exist, it needs to be created manually in Supabase dashboard."
      );
      console.log(
        "Please run the SQL from database/create_user_subscriptions_table.sql in your Supabase SQL editor."
      );
      return false;
    } catch (err) {
      console.log(
        "Table doesn't exist, it needs to be created manually in Supabase dashboard."
      );
      console.log(
        "Please run the SQL from database/create_user_subscriptions_table.sql in your Supabase SQL editor."
      );
      return false;
    }

    console.log("✅ user_subscriptions table created successfully!");

    // Verify the table was created by trying to select from it
    const { data: testData, error: testError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .limit(1);

    if (testError) {
      console.error("Error verifying table creation:", testError);
      return false;
    }

    console.log("✅ Table verification successful!");
    console.log("user_subscriptions table is ready for use.");

    return true;
  } catch (error) {
    console.error("Error in createUserSubscriptionsTable:", error);
    return false;
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  createUserSubscriptionsTable()
    .then((success) => {
      if (success) {
        console.log("✅ Migration completed successfully!");
        process.exit(0);
      } else {
        console.log("❌ Migration failed!");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("❌ Migration failed with error:", error);
      process.exit(1);
    });
}

module.exports = createUserSubscriptionsTable;
