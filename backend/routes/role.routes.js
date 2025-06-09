const express = require("express");
const router = express.Router();
const RoleController = require("../controllers/role.controller");
const { protect, authorizeSuperAdmin } = require("../middlewares/auth");

// Apply authentication middleware to all routes
// Only super_admin can manage roles in the 3 user types system
router.use(protect);
router.use(authorizeSuperAdmin);

// Get all roles (super_admin access required)
router.get("/", RoleController.getAllRoles);

// Get role by ID (super_admin access required)
router.get("/:id", RoleController.getRoleById);

// Create a new role (super_admin only)
router.post("/", RoleController.createRole);

// Update an existing role (super_admin only)
router.put("/:id", RoleController.updateRole);

// Delete a role (super_admin only)
router.delete("/:id", RoleController.deleteRole);

module.exports = router;
