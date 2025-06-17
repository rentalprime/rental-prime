const { Pool } = require("pg");
const config = require("./config");

// Create PostgreSQL connection pool with better error handling
const pool = new Pool({
  ...config.database,
  // Add connection timeout and retry settings
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20,
  // Add keepalive settings to prevent connection drops
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Test the connection
pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL connection error:", err.message);
  // Don't exit the process, let the pool handle reconnection
});

// Test initial connection
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL pool initialized successfully");
    client.release();
  } catch (err) {
    console.error("❌ Failed to initialize PostgreSQL pool:", err.message);
  }
})();

// Helper function to execute queries with retry logic
const query = async (text, params, retries = 3) => {
  let client;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      client = await pool.connect();
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      console.error(
        `Database query error (attempt ${attempt}/${retries}):`,
        error.message
      );

      if (client) {
        client.release();
        client = null;
      }

      // If this is the last attempt, throw the error
      if (attempt === retries) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    } finally {
      if (client) {
        client.release();
      }
    }
  }
};

// Helper function to execute transactions
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Helper functions for common database operations
const dbHelpers = {
  // Insert a single record
  insert: async (table, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");
    const columns = keys.join(", ");

    const queryText = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
    const result = await query(queryText, values);
    return result.rows[0];
  },

  // Update a record by ID
  update: async (table, id, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");

    // Only add updated_at = NOW() if it's not already in the data
    const hasUpdatedAt = keys.includes("updated_at");
    const updateClause = hasUpdatedAt
      ? setClause
      : `${setClause}, updated_at = NOW()`;

    const queryText = `UPDATE ${table} SET ${updateClause} WHERE id = $1 RETURNING *`;
    const result = await query(queryText, [id, ...values]);
    return result.rows[0];
  },

  // Delete a record by ID
  delete: async (table, id) => {
    const queryText = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
    const result = await query(queryText, [id]);
    return result.rows[0];
  },

  // Find a record by ID
  findById: async (table, id) => {
    const queryText = `SELECT * FROM ${table} WHERE id = $1`;
    const result = await query(queryText, [id]);
    return result.rows[0];
  },

  // Find records with conditions
  find: async (table, conditions = {}, options = {}) => {
    let queryText = `SELECT * FROM ${table}`;
    const values = [];

    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(" AND ");
      queryText += ` WHERE ${whereClause}`;
      values.push(...Object.values(conditions));
    }

    if (options.orderBy) {
      queryText += ` ORDER BY ${options.orderBy}`;
      if (options.orderDirection) {
        queryText += ` ${options.orderDirection}`;
      }
    }

    if (options.limit) {
      queryText += ` LIMIT ${options.limit}`;
    }

    if (options.offset) {
      queryText += ` OFFSET ${options.offset}`;
    }

    const result = await query(queryText, values);
    return result.rows;
  },

  // Count records
  count: async (table, conditions = {}) => {
    let queryText = `SELECT COUNT(*) FROM ${table}`;
    const values = [];

    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(" AND ");
      queryText += ` WHERE ${whereClause}`;
      values.push(...Object.values(conditions));
    }

    const result = await query(queryText, values);
    return parseInt(result.rows[0].count);
  },
};

module.exports = {
  pool,
  query,
  transaction,
  ...dbHelpers,
};
