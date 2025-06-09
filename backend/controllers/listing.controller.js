const supabase = require("../config/supabase");
const { createClient } = require("@supabase/supabase-js");
const config = require("../config/config");

// Initialize Supabase client
const supabaseClient = createClient(config.supabaseUrl, config.supabaseKey);

// @desc    Get all listings with filters
// @route   GET /api/listings
// @access  Public/Private depending on filters
exports.getListings = async (req, res) => {
  try {
    const {
      search,
      category,
      status,
      is_featured,
      minPrice,
      maxPrice,
      brand,
      condition,
      pricePeriod,
      delivery,
      availableFrom,
      availableTo,
      limit = 10,
      offset = 0,
      orderBy = "created_at",
      orderDirection = "desc",
    } = req.query;

    // Start building the query
    let query = supabase.from("listings").select(`
        *,
        category:category_id(*)
      `);

    // Apply filters if provided
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    // Category filtering
    if (category && category !== "all") {
      query = query.eq("category_id", category);
    }

    if (is_featured === "true") {
      query = query.eq("is_featured", true);
    }

    // Brand filtering
    if (brand) {
      query = query.eq("brand", brand);
    }

    // Condition filtering
    if (condition) {
      query = query.eq("condition", condition);
    }

    // Price period filtering
    if (pricePeriod) {
      query = query.eq("price_period", pricePeriod);
    }

    // Delivery option filtering
    if (delivery === "true") {
      query = query.eq("delivery", true);
    }

    // Availability date filtering
    if (availableFrom) {
      query = query.gte("available_from", availableFrom);
    }

    if (availableTo) {
      query = query.lte("available_to", availableTo);
    }

    // Search across multiple fields
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%,brand.ilike.%${search}%`
      );
    }

    // Price range filtering
    if (minPrice) {
      query = query.gte("price", minPrice);
    }

    if (maxPrice) {
      query = query.lte("price", maxPrice);
    }

    // Ordering
    query = query.order(orderBy, { ascending: orderDirection === "asc" });

    // Pagination
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    if (offset) {
      query = query.offset(parseInt(offset));
    }

    // Get count for pagination
    const { count, error: countError } = await supabase
      .from("listings")
      .select("*", { count: "exact", head: true });

    if (countError) {
      throw new Error(countError.message);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({
      success: true,
      count,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Public
exports.getListing = async (req, res) => {
  try {
    const { data: listing, error } = await supabase
      .from("listings")
      .select(
        `
        *,
        category:category_id(*)
      `
      )
      .eq("id", req.params.id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: `Listing not found with id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private (super_admin only)
exports.createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category_id,
      location,
      status = "pending",
      is_featured = false,
      images = [],
      brand,
      condition,
      specifications = [],
      price_period = "day",
      deposit = 0,
      min_duration = 1,
      available_from,
      available_to,
      delivery = false,
      shipping = 0,
      video = "",
      rental_terms = "",
      accept_deposit = true,
      cancellation = "flexible",
      notes = "",
    } = req.body;

    // Validation
    if (!title || !description || !price || !category_id || !location) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide title, description, price, category_id, and location",
      });
    }

    // Check if user exists and is from admin_users table (super_admin only)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Ensure user is from admin_users table (super_admin)
    if (req.userTable !== "admin_users") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    // Verify user exists in admin_users table
    const { data: adminUser, error: userError } = await supabase
      .from("admin_users")
      .select("id, user_type, status")
      .eq("id", req.user.id)
      .single();

    if (userError || !adminUser) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found",
      });
    }

    // Check if admin user is active
    if (adminUser.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Admin account is not active",
      });
    }

    // Create the listing
    const listingData = {
      title,
      description,
      price: parseFloat(price),
      category_id,
      location,
      status,
      is_featured,
      images,
      owner_id: req.user.id, // Admin user ID from admin_users table
      owner_type: "admin_user", // Polymorphic type for admin users
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      brand,
      condition,
      specifications,
      price_period,
      deposit: deposit ? parseFloat(deposit) : 0,
      min_duration: parseInt(min_duration) || 1,
      available_from,
      available_to,
      delivery,
      shipping: shipping ? parseFloat(shipping) : 0,
      video,
      rental_terms,
      accept_deposit,
      cancellation,
      notes,
    };

    const { data: listing, error } = await supabase
      .from("listings")
      .insert([listingData])
      .select(
        `
        *,
        category:category_id(*)
      `
      )
      .single();

    if (error) {
      console.error("Error creating listing:", error);
      throw new Error(error.message);
    }

    res.status(201).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private
exports.updateListing = async (req, res) => {
  try {
    // Check if listing exists
    const { data: existingListing, error: checkError } = await supabase
      .from("listings")
      .select("id, owner_id, owner_type")
      .eq("id", req.params.id)
      .single();

    if (checkError || !existingListing) {
      return res.status(404).json({
        success: false,
        message: `Listing not found with id of ${req.params.id}`,
      });
    }

    // Authorization check: Allow owner, admin, or super_admin to update
    if (req.user) {
      const isOwner =
        req.user.id === existingListing.owner_id &&
        req.userTable === "admin_users" &&
        existingListing.owner_type === "admin_user";
      const isAdmin =
        req.user.user_type === "admin" || req.user.user_type === "super_admin";
      const isFromAdminTable = req.userTable === "admin_users";

      // Allow if user is owner, or if user is admin/super_admin from admin_users table
      if (!isOwner && !(isAdmin && isFromAdminTable)) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this listing",
        });
      }
    }

    // Update the listing
    const updateData = { ...req.body };
    updateData.updated_at = new Date().toISOString();

    // Handle numeric conversions if they're strings
    if (updateData.price) {
      updateData.price = parseFloat(updateData.price);
    }

    if (updateData.deposit) {
      updateData.deposit = parseFloat(updateData.deposit);
    }

    if (updateData.shipping) {
      updateData.shipping = parseFloat(updateData.shipping);
    }

    if (updateData.min_duration) {
      updateData.min_duration = parseInt(updateData.min_duration);
    }

    const { data: listing, error } = await supabase
      .from("listings")
      .update(updateData)
      .eq("id", req.params.id)
      .select(
        `
        *,
        category:category_id(*)
      `
      )
      .single();

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private
exports.deleteListing = async (req, res) => {
  try {
    // Check if listing exists
    const { data: listing, error: checkError } = await supabase
      .from("listings")
      .select("id, owner_id, owner_type")
      .eq("id", req.params.id)
      .single();

    if (checkError || !listing) {
      return res.status(404).json({
        success: false,
        message: `Listing not found with id of ${req.params.id}`,
      });
    }

    // Authorization check: Allow owner, admin, or super_admin to delete
    if (req.user) {
      const isOwner =
        req.user.id === listing.owner_id &&
        req.userTable === "admin_users" &&
        listing.owner_type === "admin_user";
      const isAdmin =
        req.user.user_type === "admin" || req.user.user_type === "super_admin";
      const isFromAdminTable = req.userTable === "admin_users";

      // Allow if user is owner, or if user is admin/super_admin from admin_users table
      if (!isOwner && !(isAdmin && isFromAdminTable)) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this listing",
        });
      }
    }

    // Delete the listing
    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", req.params.id);

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get featured listings
// @route   GET /api/listings/featured
// @access  Public
exports.getFeaturedListings = async (req, res) => {
  try {
    const limit = req.query.limit || 8;

    const { data, error } = await supabase
      .from("listings")
      .select(
        `
        *,
        category:category_id(*)
      `
      )
      .eq("is_featured", true)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
