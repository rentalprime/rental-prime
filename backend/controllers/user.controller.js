const supabase = require("../config/supabase");
const { createClient } = require("@supabase/supabase-js");
const config = require("../config/config");

// Initialize Supabase client
const supabaseClient = createClient(config.supabaseUrl, config.supabaseKey);

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    // Get all users with their role information
    const {
      data: users,
      error,
      count,
    } = await supabase
      .from("users")
      .select("*, roles(name, description)", { count: "exact" });

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({
      success: true,
      count: count,
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

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*, roles(name, description)")
      .eq("id", req.params.id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: user,
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

    // Validate user_type - only allow vendor and customer for users table
    if (!user_type || !["vendor", "customer"].includes(user_type)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid user_type. Only 'vendor' and 'customer' are allowed for users table. Use /api/admins for super_admin users.",
      });
    }

    // Check if user already exists in Supabase
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

    // If role_id is not provided, get the appropriate role based on user_type
    let userRoleId = role_id;
    if (!userRoleId) {
      // Map user_type directly to role name (they now match)
      const roleName = user_type || "customer";

      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .select("id")
        .eq("name", roleName)
        .single();

      if (roleError) {
        throw new Error(
          `Role not found for user type ${user_type}. Error: ${roleError.message}`
        );
      }

      userRoleId = roleData.id;
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password, // In production, this should be properly hashed
        email_confirm: true,
      });

    if (authError) {
      throw new Error(authError.message);
    }

    // Create user profile in users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([
        {
          id: authData.user.id, // Use the auth user's ID
          email,
          name, // Store full name in name field
          password, // Include password as required by schema
          user_type, // Store the specific user type
          role_id: userRoleId, // Reference to the roles table
          status: status || "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (userError) {
      throw new Error(userError.message);
    }

    res.status(201).json({
      success: true,
      data: userData[0],
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

    // First, get the current user data to check what's being updated
    const { data: currentUser, error: getCurrentError } = await supabase
      .from("users")
      .select("email")
      .eq("id", req.params.id)
      .single();

    if (getCurrentError) {
      return res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`,
        error: getCurrentError.message,
      });
    }

    // Check if email is being updated and update Supabase Auth if needed
    if (updateData.email && updateData.email !== currentUser.email) {
      try {
        const { error: authUpdateError } =
          await supabase.auth.admin.updateUserById(req.params.id, {
            email: updateData.email,
          });

        if (authUpdateError) {
          throw new Error(
            `Failed to update auth email: ${authUpdateError.message}`
          );
        }
      } catch (authError) {
        return res.status(400).json({
          success: false,
          message: "Failed to update user authentication",
          error: authError.message,
        });
      }
    }

    // Handle password update if provided
    if (updateData.password) {
      try {
        const { error: authPasswordError } =
          await supabase.auth.admin.updateUserById(req.params.id, {
            password: updateData.password,
          });

        if (authPasswordError) {
          throw new Error(
            `Failed to update auth password: ${authPasswordError.message}`
          );
        }
      } catch (authError) {
        return res.status(400).json({
          success: false,
          message: "Failed to update user password",
          error: authError.message,
        });
      }
    }

    // Set updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // Update user in Supabase users table
    const { data: user, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", req.params.id)
      .select("*, roles(name, description)")
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`,
        error: error.message,
      });
    }

    res.status(200).json({
      success: true,
      data: user,
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
    const { data: user, error: checkError } = await supabase
      .from("users")
      .select("id, email")
      .eq("id", req.params.id)
      .single();

    if (checkError || !user) {
      return res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`,
      });
    }

    // Delete user from Supabase Auth first
    // The user ID in the users table should match the auth user ID
    const { error: authError } = await supabase.auth.admin.deleteUser(
      req.params.id
    );

    if (authError) {
      // Log the auth error but don't fail the entire operation
      // The user might not exist in auth but still exist in users table
      console.warn(
        `Warning: Could not delete user from auth: ${authError.message}`
      );
    }

    // Delete user from users table
    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", req.params.id);

    if (deleteError) {
      throw new Error(
        `Failed to delete user from users table: ${deleteError.message}`
      );
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
    const { data: user, error } = await supabase
      .from("users")
      .select("user_type")
      .eq("id", userId)
      .single();

    if (error || !user) {
      throw new Error(`User not found with id of ${userId}`);
    }

    return user.user_type;
  } catch (error) {
    throw new Error(error.message);
  }
};
