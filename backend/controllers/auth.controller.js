// const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { setOtp, verifyOtp } = require("../utils/otpStore");
// Helper function to generate JWT token
const generateToken = (userData) => {
  const payload = {
    id: userData.user_id,
    user_type: userData.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// ✅ Step 1: Send OTP
const sendOtp = async (req, res) => {
  const { mobile, email } = req.body;

  if (!mobile && !email) {
    return res
      .status(400)
      .json({ success: false, message: "Mobile or Email required" });
  }

  const contact = mobile || email;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  setOtp(contact, otp);

  // TODO: Send OTP via SMS or Email (for now just respond)
  res.status(200).json({ success: true, message: "OTP sent", otp }); // 👈 remove `otp` in prod
};

// ✅ Step 2: Verify OTP
const verifyingOtp = async (req, res) => {
  const { mobile, email, otp } = req.body;

  if (!otp || (!mobile && !email)) {
    return res
      .status(400)
      .json({ success: false, message: "OTP and contact required" });
  }

  const contact = mobile || email;
  const valid = verifyOtp(contact, otp);

  if (!valid) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired OTP" });
  }

  // Check if user exists
  const existing = await db.query(
    `SELECT * FROM users WHERE ${mobile ? "mobile" : "email"} = $1`,
    [contact]
  );

  let user;
  if (existing.rows.length === 0) {
    // Insert minimal user
    const insert = await db.query(
      `INSERT INTO users (${
        mobile ? "mobile" : "email"
      }, role) VALUES ($1, $2) RETURNING *`,
      [contact, "buyer"]
    );
    user = insert.rows[0];
  } else {
    user = existing.rows[0];
  }

  // (Optional) JWT logic can go here
  const token = generateToken(user);

  const formattedJoinDate = new Date(user.created_at).toLocaleDateString(
    "en-IN",
    {
      // day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
  res.status(200).json({
    success: true,
    message: "OTP verified",
    data: {
      id: user.user_id,
      phone: user.mobile || "",
      email: user.email || "",
      role: user.role || "",
      bio: user.bio || "",
      location: user.location || "",
      joinDate: formattedJoinDate || "",
      firstName: user.firstname || "",
      lastName: user.lastname || "",
    },
    token: token, // Include the generated token in the response
  });
};

// @desc    Register super admin user only
// @route   POST /api/auth/register
// @access  Public
// exports.register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // Validate required fields
//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide name, email, and password",
//       });
//     }

//     // Check if super admin already exists in admin_users table
//     const existingAdmin = await db.query(
//       "SELECT email FROM admin_users WHERE email = $1 LIMIT 1",
//       [email]
//     );

//     if (existingAdmin.rows.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Super admin with this email already exists",
//       });
//     }

//     // Hash password
//     const saltRounds = 12;
//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     // Generate UUID for user
//     const userId = uuidv4();

//     // Get super_admin role
//     const roleQuery = await db.query(
//       "SELECT id FROM roles WHERE name = 'super_admin' LIMIT 1"
//     );
//     const roleId = roleQuery.rows[0]?.id || null;

//     if (!roleId) {
//       throw new Error("Super admin role not found in database");
//     }

//     // Create super admin user profile in admin_users table
//     const userData = await db.insert("admin_users", {
//       id: userId,
//       email,
//       name,
//       password: hashedPassword,
//       user_type: "super_admin",
//       role_id: roleId,
//       status: "active",
//     });

//     if (!userData) {
//       throw new Error("Failed to create super admin user");
//     }

//     // Return super admin user data
//     res.status(201).json({
//       success: true,
//       data: {
//         user: userData,
//       },
//       message: "Super admin account created successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// };
const registerUserDetails = async (req, res) => {
  try {
    const { name, email, mobile, password, role } = req.body;

    if (!name || !password || !role || (!email && !mobile)) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, password, role, and email or mobile",
      });
    }

    const contactField = mobile ? "mobile" : "email";
    const contactValue = mobile || email;

    const userQuery = await db.query(
      `SELECT * FROM users WHERE ${contactField} = $1`,
      [contactValue]
    );

    if (userQuery.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user = userQuery.rows[0];
    const hashedPassword = await bcrypt.hash(password, 12);

    const update = await db.query(
      `UPDATE users SET name = $1, email = $2, mobile = $3, password = $4, role = $5, updated_at = NOW()
       WHERE user_id = $6 RETURNING user_id, name, email, mobile, role, created_at`,
      [
        name,
        email || user.email,
        mobile || user.mobile,
        hashedPassword,
        role,
        user.user_id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Registration completed",
      data: update.rows[0],
    });
  } catch (err) {
    console.error("Registration error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Validate email & password
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide an email and password",
//       });
//     }

//     // Try to get user profile data from admin_users table first
//     const adminUserQuery = await db.query(
//       `SELECT au.*, r.id as role_id, r.name as role_name, r.description as role_description, r.permissions as role_permissions
//        FROM admin_users au
//        LEFT JOIN roles r ON au.role_id = r.id
//        WHERE au.email = $1`,
//       [email]
//     );

//     let userData = null;
//     let userTable = null;

//     if (adminUserQuery.rows.length > 0) {
//       userData = adminUserQuery.rows[0];
//       userTable = "admin_users";
//     } else {
//       // If not found in admin_users, try the regular users table
//       const userQuery = await db.query(
//         `SELECT u.*, r.id as role_id, r.name as role_name, r.description as role_description, r.permissions as role_permissions
//          FROM users u
//          LEFT JOIN roles r ON u.role_id = r.id
//          WHERE u.email = $1`,
//         [email]
//       );

//       if (userQuery.rows.length > 0) {
//         userData = userQuery.rows[0];
//         userTable = "users";
//       }
//     }

//     if (!userData) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials",
//       });
//     }

//     // Check password
//     const isPasswordValid = await bcrypt.compare(password, userData.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials",
//       });
//     }

//     // Check if user is active
//     if (userData.status !== "active") {
//       return res.status(401).json({
//         success: false,
//         message: "Account is not active",
//       });
//     }

//     // Generate JWT token with complete user data
//     const tokenUserData = {
//       id: userData.id,
//       user_type: userData.user_type,
//       email: userData.email,
//       role_id: userData.role_id,
//     };
//     const token = generateToken(tokenUserData, userTable);

//     // Format user data with role information
//     const formattedUser = {
//       ...userData,
//       roles: userData.role_id
//         ? {
//             id: userData.role_id,
//             name: userData.role_name,
//             description: userData.role_description,
//             permissions: userData.role_permissions,
//           }
//         : null,
//     };

//     // Remove sensitive data
//     delete formattedUser.password;
//     delete formattedUser.role_id;
//     delete formattedUser.role_name;
//     delete formattedUser.role_description;
//     delete formattedUser.role_permissions;

//     return res.status(200).json({
//       success: true,
//       data: {
//         user: formattedUser,
//         session: {
//           access_token: token,
//           user: { id: userData.id, email: userData.email },
//         },
//         userTable,
//       },
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// };

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // req.user is already populated by protect middleware
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    console.error("getMe error:", error);
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
const logout = async (_req, res) => {
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

module.exports = {
  // login,
  registerUserDetails,
  sendOtp,
  verifyingOtp,
  getMe,
  logout,
};
