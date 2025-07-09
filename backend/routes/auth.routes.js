const express = require("express");
const {
  registerUserDetails,
  sendOtp,
  verifyingOtp,
  // login,
  getMe,
  logout,
} = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth");
``;
const router = express.Router();

router.post("/register", registerUserDetails);
router.post("/login", sendOtp);
router.post("/verify-otp", verifyingOtp);
// router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/logout", logout);

module.exports = router;
