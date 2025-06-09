const express = require("express");
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserType,
} = require("../controllers/user.controller");
const { protect, authorizeSuperAdmin } = require("../middlewares/auth");

const router = express.Router();

// Apply protection and authorization to all routes
// Only super_admin can access user management (vendor/customer users)
// This route manages users table (vendors and customers only)
router.use(protect);
router.use(authorizeSuperAdmin);

router.route("/").get(getUsers).post(createUser);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
