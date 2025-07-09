const db = require("../config/database");
const config = require("../config/config");
const jwt = require("jsonwebtoken");
/**
 * Enhanced Authentication & Authorization Middleware
 * Standardized system for the entire application
 */

// Protect routes - Authentication middleware

exports.protect = async (req, res, next) => {
  let token;
  // ✅ 1. Extract token from Authorization header or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }
  try {
    // ✅ 2. Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded", decoded);
    const userId = decoded.id;

    // ✅ 3. Get user from users table
    const userQuery = await db.query(
      `SELECT user_id, firstName, lastName, email, mobile, role, bio, location, status, created_at
       FROM users WHERE user_id = $1`,
      [userId]
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User not found in system",
      });
    }

    const user = userQuery.rows[0];

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account is inactive or suspended",
      });
    }

    // ✅ 4. Attach user to request
    req.user = {
      id: user.user_id,
      firstName: user.firstname || "",
      lastName: user.lastname || "",
      email: user.email || "",
      mobile: user.mobile || "",
      role: user.role || "",
      bio: user.bio || "",
      location: user.location || "",
      joinDate: new Date(user.created_at).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      }),
    };

    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
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
