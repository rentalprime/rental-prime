const { createClient } = require("@supabase/supabase-js");
const config = require("../config/config");

// Initialize Supabase client
const supabase = createClient(config.supabaseUrl, config.supabaseKey);

/**
 * Role Controller - Handles all role-related operations
 */
const RoleController = {
  /**
   * Get all roles
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllRoles: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error in getAllRoles:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  },

  /**
   * Get role by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getRoleById: async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      if (!data) {
        return res
          .status(404)
          .json({ success: false, error: "Role not found" });
      }

      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error in getRoleById:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  },

  /**
   * Create a new role
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createRole: async (req, res) => {
    try {
      const {
        name,
        description,
        permissions,
        is_system_role = false,
      } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ success: false, error: "Role name is required" });
      }

      // Check if role with this name already exists
      const { data: existingRole, error: checkError } = await supabase
        .from("roles")
        .select("*")
        .eq("name", name)
        .maybeSingle();

      if (checkError) {
        return res
          .status(400)
          .json({ success: false, error: checkError.message });
      }

      if (existingRole) {
        return res
          .status(400)
          .json({
            success: false,
            error: "Role with this name already exists",
          });
      }

      // Create new role
      const { data, error } = await supabase
        .from("roles")
        .insert([
          {
            name,
            description,
            permissions: permissions || {},
            is_system_role,
            status: "active",
          },
        ])
        .select();

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      return res.status(201).json({ success: true, data: data[0] });
    } catch (error) {
      console.error("Error in createRole:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  },

  /**
   * Update an existing role
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateRole: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, permissions, status } = req.body;

      // Check if role exists
      const { data: existingRole, error: checkError } = await supabase
        .from("roles")
        .select("*")
        .eq("id", id)
        .single();

      if (checkError) {
        return res
          .status(400)
          .json({ success: false, error: checkError.message });
      }

      if (!existingRole) {
        return res
          .status(404)
          .json({ success: false, error: "Role not found" });
      }

      // Prevent modification of system roles
      if (
        existingRole.is_system_role &&
        (name !== existingRole.name || status === "inactive")
      ) {
        return res.status(403).json({
          success: false,
          error: "System roles cannot be renamed or deactivated",
        });
      }

      // Update role
      const { data, error } = await supabase
        .from("roles")
        .update({
          name: name || existingRole.name,
          description:
            description !== undefined ? description : existingRole.description,
          permissions: permissions || existingRole.permissions,
          status: status || existingRole.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select();

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      return res.status(200).json({ success: true, data: data[0] });
    } catch (error) {
      console.error("Error in updateRole:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  },

  /**
   * Delete a role
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteRole: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if role exists and is not a system role
      const { data: existingRole, error: checkError } = await supabase
        .from("roles")
        .select("*")
        .eq("id", id)
        .single();

      if (checkError) {
        return res
          .status(400)
          .json({ success: false, error: checkError.message });
      }

      if (!existingRole) {
        return res
          .status(404)
          .json({ success: false, error: "Role not found" });
      }

      if (existingRole.is_system_role) {
        return res.status(403).json({
          success: false,
          error: "System roles cannot be deleted",
        });
      }

      // Check if role is being used by any users
      const { data: usersWithRole, error: userCheckError } = await supabase
        .from("users")
        .select("id")
        .eq("role_id", id);

      if (userCheckError) {
        return res
          .status(400)
          .json({ success: false, error: userCheckError.message });
      }

      if (usersWithRole && usersWithRole.length > 0) {
        return res.status(400).json({
          success: false,
          error: "Cannot delete role that is assigned to users",
        });
      }

      // Delete role
      const { error } = await supabase.from("roles").delete().eq("id", id);

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      return res.status(200).json({
        success: true,
        message: "Role deleted successfully",
      });
    } catch (error) {
      console.error("Error in deleteRole:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  },
};

module.exports = RoleController;
