const db = require("../config/database");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    // Get all users with their role information
    const query = `
      SELECT u.*, r.name as role_name, r.description as role_description
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `;

    const result = await db.query(query);
    const users = result.rows.map((user) => ({
      ...user,
      roles: user.role_name
        ? {
            name: user.role_name,
            description: user.role_description,
          }
        : null,
    }));

    // Remove sensitive data
    users.forEach((user) => {
      delete user.password;
      delete user.role_name;
      delete user.role_description;
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get users count only (optimized for dashboard)
// @route   GET /api/users/count
// @access  Private/Admin
exports.getUsersCount = async (req, res) => {
  try {
    // Get only the count for better performance
    const query = `SELECT COUNT(*) as total FROM users`;
    const result = await db.query(query);
    const count = parseInt(result.rows[0].total);

    res.status(200).json({
      success: true,
      count: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
  try {
    const query = `
      SELECT u.*, r.name as role_name, r.description as role_description
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `;

    const result = await db.query(query, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`,
      });
    }

    const user = result.rows[0];
    const formattedUser = {
      ...user,
      roles: user.role_name
        ? {
            name: user.role_name,
            description: user.role_description,
          }
        : null,
    };

    // Remove sensitive data
    delete formattedUser.password;
    delete formattedUser.role_name;
    delete formattedUser.role_description;

    res.status(200).json({
      success: true,
      data: formattedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, status, user_type, role_id } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    // Validate user_type - only allow vendor and customer for users table
    if (!user_type || !["vendor", "customer"].includes(user_type)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid user_type. Only 'vendor' and 'customer' are allowed for users table. Use /api/admins for super_admin users.",
      });
    }

    // Check if user already exists
    const existingUserQuery = await db.query(
      "SELECT email FROM users WHERE email = $1 LIMIT 1",
      [email]
    );

    if (existingUserQuery.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // If role_id is not provided, get the appropriate role based on user_type
    let userRoleId = role_id;
    if (!userRoleId) {
      const roleName = user_type || "customer";
      const roleQuery = await db.query("SELECT id FROM roles WHERE name = $1", [
        roleName,
      ]);

      if (roleQuery.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Role not found for user type ${user_type}`,
        });
      }

      userRoleId = roleQuery.rows[0].id;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate UUID for user
    const userId = uuidv4();

    // Create user profile in users table
    const userData = await db.insert("users", {
      id: userId,
      email,
      name,
      password: hashedPassword,
      user_type,
      role_id: userRoleId,
      status: status || "active",
    });

    if (!userData) {
      throw new Error("Failed to create user");
    }

    // Remove password from response
    delete userData.password;

    res.status(201).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Validate user_type if being updated - only allow vendor and customer for users table
    if (
      updateData.user_type &&
      !["vendor", "customer"].includes(updateData.user_type)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid user_type. Only 'vendor' and 'customer' are allowed for users table. Use /api/admins for super_admin users.",
      });
    }

    // First, check if user exists
    const currentUserQuery = await db.query(
      "SELECT id, email FROM users WHERE id = $1",
      [req.params.id]
    );

    if (currentUserQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`,
      });
    }

    // Handle password update if provided
    if (updateData.password) {
      const saltRounds = 12;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }

    // Remove undefined values and prepare update data
    const cleanUpdateData = {};
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        cleanUpdateData[key] = updateData[key];
      }
    });

    // Update user in database
    const updatedUser = await db.update(
      "users",
      req.params.id,
      cleanUpdateData
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`,
      });
    }

    // Get updated user with role information
    const query = `
      SELECT u.*, r.name as role_name, r.description as role_description
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `;

    const result = await db.query(query, [req.params.id]);
    const user = result.rows[0];

    const formattedUser = {
      ...user,
      roles: user.role_name
        ? {
            name: user.role_name,
            description: user.role_description,
          }
        : null,
    };

    // Remove sensitive data
    delete formattedUser.password;
    delete formattedUser.role_name;
    delete formattedUser.role_description;

    res.status(200).json({
      success: true,
      data: formattedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    // First check if user exists in users table
    const userQuery = await db.query(
      "SELECT id, email FROM users WHERE id = $1",
      [req.params.id]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`,
      });
    }

    // Delete user from users table
    const deletedUser = await db.delete("users", req.params.id);

    if (!deletedUser) {
      throw new Error("Failed to delete user from users table");
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.getUserType = async (userId) => {
  try {
    const result = await db.query("SELECT user_type FROM users WHERE id = $1", [
      userId,
    ]);

    if (result.rows.length === 0) {
      throw new Error(`User not found with id of ${userId}`);
    }

    return result.rows[0].user_type;
  } catch (error) {
    throw new Error(error.message);
  }
};
