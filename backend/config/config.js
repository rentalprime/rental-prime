/**
 * Configuration file for Rental Prima Backend
 */

module.exports = {
  // PostgreSQL Database configuration
  database: {
    host:
      process.env.DB_HOST ||
      "dpg-d16gpcvdiees73d4e9sg-a.oregon-postgres.render.com",
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || "rental_prime_database_render",
    user: process.env.DB_USER || "rental_prime_database_render_user",
    password: process.env.DB_PASSWORD || "i5j3fvDOteNEAVxBceqO4690aRcg5hA5",
    ssl: { rejectUnauthorized: false }, // Always use SSL for Render
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
    connectionTimeoutMillis: 10000, // How long to wait when connecting
  },

  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || "rental-prima-super-secret-jwt-key",
  jwtExpire: process.env.JWT_EXPIRE || "30d",

  // Server configuration
  port: process.env.PORT || 5001,
  env: process.env.NODE_ENV || "development",

  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
};
