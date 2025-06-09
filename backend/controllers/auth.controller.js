const supabase = require("../config/supabase");

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, user_type } = req.body;
    // Check if user already exists in Supabase Auth
    const { data: existingUsers, error: checkError } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .limit(1);

    if (checkError) {
      throw new Error(checkError.message);
    }

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    // Create user profile in users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([
        {
          id: authData.user.id,
          email,
          first_name: name, // Store full name in first_name field
          last_name: " ", // Use space as placeholder for last_name
          // Map user types to allowed database roles
          // 'admin' role in DB can represent both super admin and owner users
          // 'customer' role in DB represents regular customers
          role:
            user_type === "super_admin" || user_type === "owner"
              ? "admin"
              : "customer",
          // Store the specific user type in the username field as a prefix
          username: `${user_type || "customer"}_${email.split("@")[0]}`,
          status: "active",
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (userError) {
      throw new Error(userError.message);
    }

    // Return user data and session
    res.status(201).json({
      success: true,
      data: {
        user: userData[0],
        session: authData.session,
      },
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

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        error: authError.message,
      });
    }

    if (!authData.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed",
      });
    }

    // Try to get user profile data from admin_users table first
    const { data: adminUserData, error: adminUserError } = await supabase
      .from("admin_users")
      .select(
        `
        *,
        roles (
          id,
          name,
          description,
          permissions
        )
      `
      )
      .eq("id", authData.user.id)
      .single();

    if (!adminUserError && adminUserData) {
      // User found in admin_users table
      return res.status(200).json({
        success: true,
        data: {
          user: adminUserData,
          session: authData.session,
          userTable: "admin_users",
        },
      });
    }

    // If not found in admin_users, try the regular users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(
        `
        *,
        roles (
          id,
          name,
          description,
          permissions
        )
      `
      )
      .eq("id", authData.user.id)
      .single();

    if (userError || !userData) {
      return res.status(404).json({
        success: false,
        message: "User profile not found in system",
        error: userError?.message,
      });
    }

    // User found in users table
    return res.status(200).json({
      success: true,
      data: {
        user: userData,
        session: authData.session,
        userTable: "users",
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

    // Verify the token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
        error: error?.message,
      });
    }

    // Try to get user profile data from admin_users table first
    const { data: adminUserData, error: adminUserError } = await supabase
      .from("admin_users")
      .select(
        `
        *,
        roles (
          id,
          name,
          description,
          permissions
        )
      `
      )
      .eq("id", user.id)
      .single();

    if (!adminUserError && adminUserData) {
      // User found in admin_users table
      return res.status(200).json({
        success: true,
        data: adminUserData,
        userTable: "admin_users",
      });
    }

    // If not found in admin_users, try the regular users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(
        `
        *,
        roles (
          id,
          name,
          description,
          permissions
        )
      `
      )
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return res.status(404).json({
        success: false,
        message: "User profile not found in system",
        error: userError?.message,
      });
    }

    // User found in users table
    res.status(200).json({
      success: true,
      data: userData,
      userTable: "users",
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
exports.logout = async (req, res) => {
  try {
    // Get the JWT from the authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }
    }

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
