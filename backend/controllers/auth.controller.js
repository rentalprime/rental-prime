const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { v4: uuidv4 } = require("uuid");

// Helper function to generate JWT token
const generateToken = (userData, userTable = "users") => {
  const payload = {
    id: userData.id || userData,
    user_type: userData.user_type,
    email: userData.email,
    userTable: userTable,
    role_id: userData.role_id,
  };

  // If only userId is passed (backward compatibility)
  if (typeof userData === "string") {
    payload.id = userData;
    // Remove undefined fields for backward compatibility
    delete payload.user_type;
    delete payload.email;
    delete payload.userTable;
    delete payload.role_id;
  }

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });
};

// @desc    Register super admin user only
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    // Check if super admin already exists in admin_users table
    const existingAdmin = await db.query(
      "SELECT email FROM admin_users WHERE email = $1 LIMIT 1",
      [email]
    );

    if (existingAdmin.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Super admin with this email already exists",
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate UUID for user
    const userId = uuidv4();

    // Get super_admin role
    const roleQuery = await db.query(
      "SELECT id FROM roles WHERE name = 'super_admin' LIMIT 1"
    );
    const roleId = roleQuery.rows[0]?.id || null;

    if (!roleId) {
      throw new Error("Super admin role not found in database");
    }

    // Create super admin user profile in admin_users table
    const userData = await db.insert("admin_users", {
      id: userId,
      email,
      name,
      password: hashedPassword,
      user_type: "super_admin",
      role_id: roleId,
      status: "active",
    });

    if (!userData) {
      throw new Error("Failed to create super admin user");
    }

    // Return super admin user data
    res.status(201).json({
      success: true,
      data: {
        user: userData,
      },
      message: "Super admin account created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email and password",
      });
    }

    // Try to get user profile data from admin_users table first
    const adminUserQuery = await db.query(
      `SELECT au.*, r.id as role_id, r.name as role_name, r.description as role_description, r.permissions as role_permissions
       FROM admin_users au
       LEFT JOIN roles r ON au.role_id = r.id
       WHERE au.email = $1`,
      [email]
    );

    let userData = null;
    let userTable = null;

    if (adminUserQuery.rows.length > 0) {
      userData = adminUserQuery.rows[0];
      userTable = "admin_users";
    } else {
      // If not found in admin_users, try the regular users table
      const userQuery = await db.query(
        `SELECT u.*, r.id as role_id, r.name as role_name, r.description as role_description, r.permissions as role_permissions
         FROM users u
         LEFT JOIN roles r ON u.role_id = r.id
         WHERE u.email = $1`,
        [email]
      );

      if (userQuery.rows.length > 0) {
        userData = userQuery.rows[0];
        userTable = "users";
      }
    }

    if (!userData) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is active
    if (userData.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Account is not active",
      });
    }

    // Generate JWT token with complete user data
    const tokenUserData = {
      id: userData.id,
      user_type: userData.user_type,
      email: userData.email,
      role_id: userData.role_id,
    };
    const token = generateToken(tokenUserData, userTable);

    // Format user data with role information
    const formattedUser = {
      ...userData,
      roles: userData.role_id
        ? {
            id: userData.role_id,
            name: userData.role_name,
            description: userData.role_description,
            permissions: userData.role_permissions,
          }
        : null,
    };

    // Remove sensitive data
    delete formattedUser.password;
    delete formattedUser.role_id;
    delete formattedUser.role_name;
    delete formattedUser.role_description;
    delete formattedUser.role_permissions;

    return res.status(200).json({
      success: true,
      data: {
        user: formattedUser,
        session: {
          access_token: token,
          user: { id: userData.id, email: userData.email },
        },
        userTable,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    // Get the JWT from the authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    // Verify the JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        error: jwtError.message,
      });
    }

    const userId = decoded.id;

    // Try to get user profile data from admin_users table first
    const adminUserQuery = await db.query(
      `SELECT au.*, r.id as role_id, r.name as role_name, r.description as role_description, r.permissions as role_permissions
       FROM admin_users au
       LEFT JOIN roles r ON au.role_id = r.id
       WHERE au.id = $1`,
      [userId]
    );

    let userData = null;
    let userTable = null;

    if (adminUserQuery.rows.length > 0) {
      userData = adminUserQuery.rows[0];
      userTable = "admin_users";
    } else {
      // If not found in admin_users, try the regular users table
      const userQuery = await db.query(
        `SELECT u.*, r.id as role_id, r.name as role_name, r.description as role_description, r.permissions as role_permissions
         FROM users u
         LEFT JOIN roles r ON u.role_id = r.id
         WHERE u.id = $1`,
        [userId]
      );

      if (userQuery.rows.length > 0) {
        userData = userQuery.rows[0];
        userTable = "users";
      }
    }

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User profile not found in system",
      });
    }

    // Format user data with role information
    const formattedUser = {
      ...userData,
      roles: userData.role_id
        ? {
            id: userData.role_id,
            name: userData.role_name,
            description: userData.role_description,
            permissions: userData.role_permissions,
          }
        : null,
    };

    // Remove sensitive data
    delete formattedUser.password;
    delete formattedUser.role_id;
    delete formattedUser.role_name;
    delete formattedUser.role_description;
    delete formattedUser.role_permissions;

    res.status(200).json({
      success: true,
      data: formattedUser,
      userTable,
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (_req, res) => {
  try {
    // Clear any cookies
    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging out",
      error: error.message,
    });
  }
};
