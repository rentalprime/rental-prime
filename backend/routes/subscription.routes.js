const express = require("express");
const router = express.Router();
const { protect, authorizeVendor } = require("../middlewares/auth");
const {
  assignPlan,
  getVendorSubscriptions,
  cancelSubscription,
} = require("../controllers/subscription.controller");

/**
 * Subscription Routes
 * All routes require vendor authentication
 */

// @route   POST /api/subscriptions/assign
// @desc    Assign plan to vendor (self-assignment)
// @access  Private/Vendor
router.route("/assign").post(protect, authorizeVendor, assignPlan);

// @route   GET /api/subscriptions
// @desc    Get vendor's subscriptions
// @access  Private/Vendor
router.route("/").get(protect, authorizeVendor, getVendorSubscriptions);

// @route   PUT /api/subscriptions/:id/cancel
// @desc    Cancel vendor's subscription
// @access  Private/Vendor
router.route("/:id/cancel").put(protect, authorizeVendor, cancelSubscription);

module.exports = router;
