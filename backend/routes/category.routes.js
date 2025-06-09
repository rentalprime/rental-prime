const express = require("express");
const router = express.Router();
const { protect, authorizeSuperAdmin } = require("../middlewares/auth");

// Import category controller functions
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryHierarchy,
  getCategoryBySlug,
  getCategoryStats,
} = require("../controllers/category.controller");

// Routes

// Main category routes
router
  .route("/")
  .get(getCategories) // Public access for reading categories
  .post(protect, authorizeSuperAdmin, createCategory); // Super admin only for creating

// Special routes (must come before /:id routes)
router.route("/hierarchy").get(getCategoryHierarchy); // Public access

router.route("/stats").get(protect, authorizeSuperAdmin, getCategoryStats); // Super admin only for stats

router.route("/slug/:slug").get(getCategoryBySlug);

// ID-based routes
router
  .route("/:id")
  .get(getCategory) // Public access for reading single category
  .put(protect, authorizeSuperAdmin, updateCategory) // Super admin only for updating
  .delete(protect, authorizeSuperAdmin, deleteCategory); // Super admin only for deleting

module.exports = router;
