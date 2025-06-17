const db = require("../config/database");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

// @desc    Get all admin users
// @route   GET /api/admins
// @access  Private/SuperAdmin
exports.getAdminUsers = async (req, res) => {
  try {
    // Authentication and authorization handled by middleware
    // Get all admin users with their role information
    const query = `
      SELECT au.*, r.name as role_name, r.description as role_description, r.permissions as role_permissions
      FROM admin_users au
      LEFT JOIN roles r ON au.role_id = r.id
      ORDER BY au.created_at DESC
    `;

    const result = await db.query(query);
    const adminUsers = result.rows.map((user) => ({
      ...user,
      roles: user.role_name
        ? {
            name: user.role_name,
            description: user.role_description,
            permissions: user.role_permissions,
          }
        : null,
    }));

    // Remove sensitive data
    adminUsers.forEach((user) => {
      delete user.password;
      delete user.role_name;
      delete user.role_description;
      delete user.role_permissions;
    });

    res.status(200).json({
      success: true,
      count: adminUsers.length,
      data: adminUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get single admin user
// @route   GET /api/admins/:id
// @access  Private/SuperAdmin
exports.getAdminUser = async (req, res) => {
  try {
    // Authentication and authorization handled by middleware
    const query = `
      SELECT au.*, r.name as role_name, r.description as role_description, r.permissions as role_permissions
      FROM admin_users au
      LEFT JOIN roles r ON au.role_id = r.id
      WHERE au.id = $1
    `;

    const result = await db.query(query, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Admin user not found with id of ${req.params.id}`,
      });
    }

    const adminUser = result.rows[0];
    const formattedUser = {
      ...adminUser,
      roles: adminUser.role_name
        ? {
            name: adminUser.role_name,
            description: adminUser.role_description,
            permissions: adminUser.role_permissions,
          }
        : null,
    };

    // Remove sensitive data
    delete formattedUser.password;
    delete formattedUser.role_name;
    delete formattedUser.role_description;
    delete formattedUser.role_permissions;

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

// @desc    Create admin user
// @route   POST /api/admins
// @access  Private/SuperAdmin
exports.createAdminUser = async (req, res) => {
  try {
    // Authentication and authorization handled by middleware
    const { name, email, password, status, user_type } = req.body;

    // Validate required fields
    if (!name || !email || !password || !user_type) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, password, and user_type",
      });
    }

    // Validate user_type - allow admin user types for admin_users table
    const allowedAdminUserTypes = [
      "super_admin",
      "admin",
      "manager",
      "accountant",
      "support",
    ];
    if (!allowedAdminUserTypes.includes(user_type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid user_type. Allowed admin user types: ${allowedAdminUserTypes.join(
          ", "
        )}. Use /api/users for vendor and customer users.`,
      });
    }

    // Check if admin user already exists
    const existingAdminQuery = await db.query(
      "SELECT email FROM admin_users WHERE email = $1 LIMIT 1",
      [email]
    );

    if (existingAdminQuery.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Admin user already exists",
      });
    }

    // Automatically assign role based on user_type (ignore role_id from request)
    // Map user_type to role name for admin users
    const roleName = user_type;

    const roleQuery = await db.query("SELECT id FROM roles WHERE name = $1", [
      roleName,
    ]);

    if (roleQuery.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Role not found for user type ${user_type}`,
      });
    }

    const adminRoleId = roleQuery.rows[0].id;

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate UUID for admin user
    const adminUserId = uuidv4();

    // Create admin user profile in admin_users table
    const adminUserData = await db.insert("admin_users", {
      id: adminUserId,
      email,
      name,
      password: hashedPassword,
      user_type,
      role_id: adminRoleId,
      status: status || "active",
    });

    if (!adminUserData) {
      throw new Error("Failed to create admin user");
    }

    // Remove password from response
    delete adminUserData.password;

    res.status(201).json({
      success: true,
      data: adminUserData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update admin user
// @route   PUT /api/admins/:id
// @access  Private/SuperAdmin
exports.updateAdminUser = async (req, res) => {
  try {
    // Authentication and authorization handled by middleware
    const updateData = { ...req.body };

    // Validate user_type if being updated - allow admin user types for admin_users table
    if (updateData.user_type) {
      const allowedAdminUserTypes = [
        "super_admin",
        "admin",
        "manager",
        "accountant",
        "support",
      ];
      if (!allowedAdminUserTypes.includes(updateData.user_type)) {
        return res.status(400).json({
          success: false,
          message: `Invalid user_type. Allowed admin user types: ${allowedAdminUserTypes.join(
            ", "
          )}. Use /api/users for vendor and customer users.`,
        });
      }
    }

    // First, check if admin user exists
    const currentAdminQuery = await db.query(
      "SELECT id, email FROM admin_users WHERE id = $1",
      [req.params.id]
    );

    if (currentAdminQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Admin user not found with id of ${req.params.id}`,
      });
    }

    // Handle password update if provided
    if (updateData.password) {
      const saltRounds = 12;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }

    // If user_type is being updated, automatically assign the corresponding role
    if (updateData.user_type) {
      const roleName = updateData.user_type;

      const roleQuery = await db.query("SELECT id FROM roles WHERE name = $1", [
        roleName,
      ]);

      if (roleQuery.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Role not found for user type ${updateData.user_type}`,
        });
      }

      updateData.role_id = roleQuery.rows[0].id;
    }

    // Remove undefined values and prepare update data
    const cleanUpdateData = {};
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        cleanUpdateData[key] = updateData[key];
      }
    });

    // Update admin user in database
    const updatedAdminUser = await db.update(
      "admin_users",
      req.params.id,
      cleanUpdateData
    );

    if (!updatedAdminUser) {
      return res.status(404).json({
        success: false,
        message: `Admin user not found with id of ${req.params.id}`,
      });
    }

    // Get updated admin user with role information
    const query = `
      SELECT au.*, r.name as role_name, r.description as role_description, r.permissions as role_permissions
      FROM admin_users au
      LEFT JOIN roles r ON au.role_id = r.id
      WHERE au.id = $1
    `;

    const result = await db.query(query, [req.params.id]);
    const adminUser = result.rows[0];

    const formattedUser = {
      ...adminUser,
      roles: adminUser.role_name
        ? {
            name: adminUser.role_name,
            description: adminUser.role_description,
            permissions: adminUser.role_permissions,
          }
        : null,
    };

    // Remove sensitive data
    delete formattedUser.password;
    delete formattedUser.role_name;
    delete formattedUser.role_description;
    delete formattedUser.role_permissions;

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

// @desc    Delete admin user
// @route   DELETE /api/admins/:id
// @access  Private/SuperAdmin
exports.deleteAdminUser = async (req, res) => {
  try {
    // Authentication and authorization handled by middleware
    // First check if admin user exists
    const adminUserQuery = await db.query(
      "SELECT id, email FROM admin_users WHERE id = $1",
      [req.params.id]
    );

    if (adminUserQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Admin user not found with id of ${req.params.id}`,
      });
    }

    // Delete admin user from admin_users table
    const deletedAdminUser = await db.delete("admin_users", req.params.id);

    if (!deletedAdminUser) {
      throw new Error("Failed to delete admin user from admin_users table");
    }

    res.status(200).json({
      success: true,
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
