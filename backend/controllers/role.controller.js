const db = require("../config/database");

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
      const result = await db.query("SELECT * FROM roles ORDER BY name ASC");

      return res.status(200).json({
        success: true,
        data: result.rows,
      });
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

      const result = await db.query("SELECT * FROM roles WHERE id = $1", [id]);

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Role not found" });
      }

      return res.status(200).json({
        success: true,
        data: result.rows[0],
      });
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
      const existingRoleResult = await db.query(
        "SELECT * FROM roles WHERE name = $1",
        [name]
      );

      if (existingRoleResult.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: "Role with this name already exists",
        });
      }

      // Create new role
      const result = await db.query(
        `INSERT INTO roles (name, description, permissions, is_system_role, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING *`,
        [
          name,
          description,
          JSON.stringify(permissions || {}),
          is_system_role,
          "active",
        ]
      );

      return res.status(201).json({
        success: true,
        data: result.rows[0],
      });
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
      const existingRoleResult = await db.query(
        "SELECT * FROM roles WHERE id = $1",
        [id]
      );

      if (existingRoleResult.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Role not found" });
      }

      const existingRole = existingRoleResult.rows[0];

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
      const result = await db.query(
        `UPDATE roles
         SET name = $1, description = $2, permissions = $3, status = $4, updated_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [
          name || existingRole.name,
          description !== undefined ? description : existingRole.description,
          JSON.stringify(permissions || existingRole.permissions),
          status || existingRole.status,
          id,
        ]
      );

      return res.status(200).json({
        success: true,
        data: result.rows[0],
      });
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
      const existingRoleResult = await db.query(
        "SELECT * FROM roles WHERE id = $1",
        [id]
      );

      if (existingRoleResult.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Role not found" });
      }

      const existingRole = existingRoleResult.rows[0];

      if (existingRole.is_system_role) {
        return res.status(403).json({
          success: false,
          error: "System roles cannot be deleted",
        });
      }

      // Check if role is being used by any users
      const usersWithRoleResult = await db.query(
        "SELECT id FROM users WHERE role_id = $1",
        [id]
      );

      if (usersWithRoleResult.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: "Cannot delete role that is assigned to users",
        });
      }

      // Delete role
      await db.query("DELETE FROM roles WHERE id = $1", [id]);

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
