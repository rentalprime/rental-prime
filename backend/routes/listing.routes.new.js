const express = require("express");
const router = express.Router();
const { protect, authorizeVendorCustomer } = require("../middlewares/auth");
const {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getFeaturedListings,
  getListingsByVendor,
  getListingsByCategory,
} = require("../controllers/listing.controller.new");

/**
 * @route   GET /api/listings
 * @desc    Get all listings with filters
 * @access  Public
 */
router.get("/", getListings);

/**
 * @route   GET /api/listings/featured
 * @desc    Get featured listings
 * @access  Public
 */
router.get("/featured", getFeaturedListings);

/**
 * @route   GET /api/listings/vendor/:userId
 * @desc    Get listings by vendor
 * @access  Public
 */
router.get("/vendor/:userId", getListingsByVendor);

/**
 * @route   GET /api/listings/category/:categoryId
 * @desc    Get listings by category
 * @access  Public
 */
router.get("/category/:categoryId", getListingsByCategory);

/**
 * @route   GET /api/listings/:id
 * @desc    Get single listing
 * @access  Public
 */
router.get("/:id", getListing);

/**
 * @route   POST /api/listings
 * @desc    Create a new listing
 * @access  Private (vendors only)
 */
router.post("/", protect, authorizeVendorCustomer("vendor"), createListing);
// router.post("/", createListing);

/**
 * @route   PUT /api/listings/:id
 * @desc    Update a listing
 * @access  Private (owner or admin)
 */
router.put("/:id", protect, updateListing);
// router.put("/:id", updateListing);

/**
 * @route   DELETE /api/listings/:id
 * @desc    Delete a listing
 * @access  Private (owner or admin)
 */
router.delete("/:id", protect, deleteListing);
// router.delete("/:id", deleteListing);

module.exports = router;
