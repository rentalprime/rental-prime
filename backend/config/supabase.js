const { createClient } = require("@supabase/supabase-js");
const { env } = require("./config");

// Initialize the Supabase client with the provided credentials
const supabaseUrl =
  process.env.SUPABASE_URL || "https://vmwjqwgvzmwjomcehabe.supabase.co";
// const supabaseAnonKey =
//   process.env.SUPABASE_ANON_KEY ||
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtd2pxd2d2em13am9tY2VoYWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4OTgyODYsImV4cCI6MjA2MzQ3NDI4Nn0.pxO8lrc8z6ByVJ-7bKny7LjRfmCHD4iMcbM1NbaMS8U";
const supabase_service_role =
  process.env.SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtd2pxd2d2em13am9tY2VoYWJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg5ODI4NiwiZXhwIjoyMDYzNDc0Mjg2fQ.H1YMO_Tye6ikWth7csEwPMWI3CxYcQaQ6N6oNXwf-0c";
const supabase = createClient(supabaseUrl, supabase_service_role);

module.exports = supabase;
