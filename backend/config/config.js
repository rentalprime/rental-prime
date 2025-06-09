/**
 * Configuration file for Rental Prima Backend
 */

module.exports = {
  // Supabase configuration
  supabaseUrl:
    process.env.SUPABASE_URL || "https://vmwjqwgvzmwjomcehabe.supabase.co",
  // supabaseKey:
  //   process.env.SUPABASE_ANON_KEY ||
  //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtd2pxd2d2em13am9tY2VoYWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4OTgyODYsImV4cCI6MjA2MzQ3NDI4Nn0.pxO8lrc8z6ByVJ-7bKny7LjRfmCHD4iMcbM1NbaMS8U",
  supabaseKey:
    process.env.SUPERBASE_SERVICE_ROLE ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtd2pxd2d2em13am9tY2VoYWJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg5ODI4NiwiZXhwIjoyMDYzNDc0Mjg2fQ.H1YMO_Tye6ikWth7csEwPMWI3CxYcQaQ6N6oNXwf-0c",

  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || "rental-prima-super-secret-jwt-key",
  jwtExpire: process.env.JWT_EXPIRE || "30d",

  // Server configuration
  port: process.env.PORT || 5001,
  env: process.env.NODE_ENV || "development",

  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
};
