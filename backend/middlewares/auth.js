const db = require("../config/database");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

/**
 * Enhanced Authentication & Authorization Middleware
 * Standardized system for the entire application
 */

// Protect routes - Authentication middleware
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    // Set token from cookie
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, config.jwtSecret);
    const userId = decoded.id;

    // Try to get user data from admin_users table first (for admin users)
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
      // Try users table (for vendors and customers)
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
      return res.status(401).json({
        success: false,
        message: "User not found in system",
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

    req.user = formattedUser;
    req.userTable = userTable;
    req.token = token;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
      error: err.message,
    });
  }
};

// Authorize access to specific user types
// Works across both admin_users and users tables
exports.authorize = (...userTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!userTypes.includes(req.user.user_type)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. User type '${
          req.user?.user_type || "unknown"
        }' is not authorized to access this route. Required: ${userTypes.join(
          ", "
        )}. User is from ${req.userTable} table.`,
      });
    }
    next();
  };
};

// Authorize vendor and customer access only (users table)
// Note: Vendors and customers are stored in users table
exports.authorizeVendorCustomer = (...userTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const isFromUsersTable = req.userTable === "users";
    const validUserTypes =
      userTypes.length > 0 ? userTypes : ["vendor", "customer"];

    if (!isFromUsersTable) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. This resource is only available to vendors and customers.",
      });
    }

    if (!validUserTypes.includes(req.user.user_type)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. User type '${
          req.user?.user_type || "unknown"
        }' is not authorized. Required: ${validUserTypes.join(", ")}`,
      });
    }

    next();
  };
};

// Authorize access to specific roles
exports.authorizeRole = (...roleNames) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const userRole = req.user.roles?.name;
    if (!userRole || !roleNames.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${
          userRole || "unknown"
        }' is not authorized to access this route. Required: ${roleNames.join(
          ", "
        )}`,
      });
    }
    next();
  };
};

// Authorize admin access (admin or super_admin)
// Note: Admin users are stored in admin_users table
exports.authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  const userRole = req.user.roles?.name;
  const userType = req.user.user_type;
  const isFromAdminTable = req.userTable === "admin_users";

  // Check if user is from admin_users table and has admin privileges
  if (
    isFromAdminTable &&
    (userRole === "admin" ||
      userRole === "super_admin" ||
      userType === "admin" ||
      userType === "super_admin")
  ) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message:
      "Access denied. Admin privileges required. Only admin users can access this resource.",
  });
};

// Authorize super admin access only
// Note: Super admin users are stored in admin_users table
exports.authorizeSuperAdmin = (req, res, next) => {
  // console.log("authorizeSuperAdmin called", req.user);
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  const userRole = req.user.roles?.name;
  const userType = req.user.user_type;
  const isFromAdminTable = req.userTable === "admin_users";

  // Check if user is from admin_users table and has super admin privileges
  if (
    isFromAdminTable &&
    (userRole === "super_admin" || userType === "super_admin")
  ) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message:
      "Access denied. Super admin privileges required. Only super admin users can access this resource.",
  });
};

// Authorize vendor access only
// Note: Vendors are stored in users table with user_type 'vendor'
exports.authorizeVendor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  const isFromUsersTable = req.userTable === "users";
  const userType = req.user.user_type;

  if (!isFromUsersTable) {
    return res.status(403).json({
      success: false,
      message: "Access denied. This resource is only available to vendors.",
    });
  }

  if (userType !== "vendor") {
    return res.status(403).json({
      success: false,
      message: `Access denied. User type '${
        userType || "unknown"
      }' is not authorized. Only vendors can access this resource.`,
    });
  }

  next();
};

// Check specific permissions
exports.checkPermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const permissions = req.user.roles?.permissions;

    // Super admin has all permissions
    if (permissions?.all === true) {
      return next();
    }

    // Check specific permission
    const resourcePermissions = permissions?.[resource];
    if (resourcePermissions?.[action] === true) {
      console.log("Super admin has all permissions. Access granted.");

      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Permission '${resource}.${action}' required.`,
    });
  };
};
