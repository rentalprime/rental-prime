const pool = require("../../config/database");

// CREATE user
exports.createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      mobile,
      password,
      role,
      bio,
      location,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO users (firstName, lastName, email, mobile, password, role, bio, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [firstName, lastName, email, mobile, password, role, bio, location]
    );

    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "User creation failed" });
  }
};

// READ all users
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

// READ single user
exports.getUserById = async (req, res) => {
  try {
    // const { id } = req.params;
    const id = req.user.id;

    const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      id,
    ]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching user" });
  }
};

// UPDATE user
// UPDATE user with fallback to existing values
exports.updateUser = async (req, res) => {
  try {
    const id = req.user.id;
    // Step 1: Fetch existing user
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const oldUser = existingUser.rows[0];

    // Step 2: Use new value if provided, else keep old one
    const {
      firstName = oldUser.firstName,
      lastName = oldUser.lastName,
      email = oldUser.email,
      mobile = oldUser.mobile,
      password = oldUser.password,
      role = oldUser.role,
      status = oldUser.status,
      bio = oldUser.bio,
      location = oldUser.location,
    } = req.body;

    // Step 3: Update query
    const result = await pool.query(
      `UPDATE users SET
        firstName = $1,
        lastName = $2,
        email = $3,
        mobile = $4,
        password = $5,
        role = $6,
        status = $7,
        bio = $8,
        location = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $10
      RETURNING *`,
      [
        firstName,
        lastName,
        email,
        mobile,
        password,
        role,
        status,
        bio,
        location,
        id,
      ]
    );

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ success: false, message: "Error updating user" });
  }
};

// DELETE user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM users WHERE user_id = $1", [
      id,
    ]);

    if (result.rowCount === 0)
      return res.status(404).json({ message: "User not found" });

    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
};
