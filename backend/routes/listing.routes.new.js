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
  getBatchCategoryCounts,
  getListingsCount,
} = require("../controllers/listing.controller.new");

/**
 * @route   GET /api/listings
 * @desc    Get all listings with filters
 * @access  Public
 */
router.get("/", getListings);

/**
 * @route   GET /api/listings/count
 * @desc    Get listings count only (optimized for dashboard)
 * @access  Private (vendors get their count, admins get all count)
 */
router.get("/count", protect, getListingsCount);

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
 * @route   POST /api/listings/category-counts
 * @desc    Get listing counts for multiple categories in batch
 * @access  Public
 */
router.post("/category-counts", getBatchCategoryCounts);

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

/**
 * @route   PUT /api/listings/:id
 * @desc    Update a listing
 * @access  Private (owner or admin)
 */
router.put("/:id", protect, updateListing);

/**
 * @route   DELETE /api/listings/:id
 * @desc    Delete a listing
 * @access  Private (owner or admin)
 */
router.delete("/:id", protect, deleteListing);

module.exports = router;
