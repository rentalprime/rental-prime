const express = require("express");
const {
  getAdminUsers,
  getAdminUser,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} = require("../controllers/admin.controller");
const { protect, authorizeSuperAdmin } = require("../middlewares/auth");

const router = express.Router();

// Apply protection and authorization to all routes
// Only super admin can access admin management
router.use(protect);
router.use(authorizeSuperAdmin);

// @route   GET /api/admins
// @desc    Get all admin users
// @access  Private/SuperAdmin
router.get("/", getAdminUsers);

// @route   POST /api/admins
// @desc    Create new admin user
// @access  Private/SuperAdmin
router.post("/", createAdminUser);

// @route   GET /api/admins/:id
// @desc    Get single admin user
// @access  Private/SuperAdmin
router.get("/:id", getAdminUser);

// @route   PUT /api/admins/:id
// @desc    Update admin user
// @access  Private/SuperAdmin
router.put("/:id", updateAdminUser);

// @route   DELETE /api/admins/:id
// @desc    Delete admin user
// @access  Private/SuperAdmin
router.delete("/:id", deleteAdminUser);

module.exports = router;
