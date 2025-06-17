const db = require("../config/database");
const { v4: uuidv4 } = require("uuid");
const {
  validateListingCreation,
  validateListingUpdate,
} = require("../utils/planValidator");

/**
 * @desc    Get all listings with filters
 * @route   GET /api/listings
 * @access  Public/Private (if authenticated, shows user's listings only)
 */
exports.getListings = async (req, res) => {
  try {
    const {
      search,
      category,
      // subcategory,
      status,
      featured,
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

    // Check if user is authenticated and is a vendor
    const isVendorRequest =
      req.user && req.user.user_type === "vendor" && req.userTable === "users";

    // Build the PostgreSQL query with category information
    let queryText = `
      SELECT
        l.*,
        c.id as category_id_info, c.name as category_name, c.slug as category_slug,
        c.description as category_description, c.image_url as category_image_url
      FROM listings l
      LEFT JOIN categories c ON l.category_id = c.id
      WHERE l.owner_type = 'user'
    `;

    // If authenticated vendor, filter by their listings only
    if (isVendorRequest) {
      queryText += ` AND l.owner_id = '${req.user.id}'`;
    }

    const conditions = [];
    const values = [];
    let paramCount = 0;

    // Apply filters if provided
    if (status && status !== "all") {
      paramCount++;
      conditions.push(`l.status = $${paramCount}`);
      values.push(status);
    }

    // Category filtering
    if (category && category !== "all") {
      paramCount++;
      conditions.push(`l.category_id = $${paramCount}`);
      values.push(category);
    }

    if (featured === "true") {
      paramCount++;
      conditions.push(`l.is_featured = $${paramCount}`);
      values.push(true);
    }

    // Brand filtering
    if (brand) {
      paramCount++;
      conditions.push(`l.brand = $${paramCount}`);
      values.push(brand);
    }

    // Condition filtering
    if (condition) {
      paramCount++;
      conditions.push(`l.condition = $${paramCount}`);
      values.push(condition);
    }

    // Price period filtering
    if (pricePeriod) {
      paramCount++;
      conditions.push(`l.price_period = $${paramCount}`);
      values.push(pricePeriod);
    }

    // Delivery option filtering
    if (delivery === "true") {
      paramCount++;
      conditions.push(`l.delivery = $${paramCount}`);
      values.push(true);
    }

    // Availability date filtering
    if (availableFrom) {
      paramCount++;
      conditions.push(`l.available_from >= $${paramCount}`);
      values.push(availableFrom);
    }

    if (availableTo) {
      paramCount++;
      conditions.push(`l.available_to <= $${paramCount}`);
      values.push(availableTo);
    }

    // Search across multiple fields
    if (search) {
      paramCount++;
      conditions.push(
        `(l.title ILIKE $${paramCount} OR l.description ILIKE $${paramCount} OR l.location ILIKE $${paramCount} OR l.brand ILIKE $${paramCount})`
      );
      values.push(`%${search}%`);
    }

    // Price range filtering
    if (minPrice) {
      paramCount++;
      conditions.push(`l.price >= $${paramCount}`);
      values.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      paramCount++;
      conditions.push(`l.price <= $${paramCount}`);
      values.push(parseFloat(maxPrice));
    }

    // Add additional conditions
    if (conditions.length > 0) {
      queryText += ` AND ${conditions.join(" AND ")}`;
    }

    // Ordering
    const validOrderFields = ["created_at", "updated_at", "price", "title"];
    const orderField = validOrderFields.includes(orderBy)
      ? orderBy
      : "created_at";
    const direction = orderDirection === "asc" ? "ASC" : "DESC";
    queryText += ` ORDER BY l.${orderField} ${direction}`;

    // Pagination
    if (limit) {
      paramCount++;
      queryText += ` LIMIT $${paramCount}`;
      values.push(parseInt(limit));
    }

    if (offset) {
      paramCount++;
      queryText += ` OFFSET $${paramCount}`;
      values.push(parseInt(offset));
    }

    // Execute the main query
    const result = await db.query(queryText, values);
    const listings = result.rows.map((row) => ({
      ...row,
      images:
        typeof row.images === "string" ? JSON.parse(row.images) : row.images,
      specifications:
        typeof row.specifications === "string"
          ? JSON.parse(row.specifications)
          : row.specifications,
      category: row.category_id_info
        ? {
            id: row.category_id_info,
            name: row.category_name,
            slug: row.category_slug,
            description: row.category_description,
            image_url: row.category_image_url,
          }
        : null,
      // Remove the separate category fields
      category_id_info: undefined,
      category_name: undefined,
      category_slug: undefined,
      category_description: undefined,
      category_image_url: undefined,
    }));

    // Get count for pagination (only user listings)
    let countQuery = "SELECT COUNT(*) FROM listings WHERE owner_type = 'user'";
    const countConditions = [];
    const countValues = [];
    let countParamCount = 0;

    // If authenticated vendor, filter count by their listings only
    if (isVendorRequest) {
      countParamCount++;
      countConditions.push(`owner_id = $${countParamCount}`);
      countValues.push(req.user.id);
    }

    // Apply same filters for count
    if (status && status !== "all") {
      countParamCount++;
      countConditions.push(`status = $${countParamCount}`);
      countValues.push(status);
    }

    if (category && category !== "all") {
      countParamCount++;
      countConditions.push(`category_id = $${countParamCount}`);
      countValues.push(category);
    }

    if (featured === "true") {
      countParamCount++;
      countConditions.push(`is_featured = $${countParamCount}`);
      countValues.push(true);
    }

    if (brand) {
      countParamCount++;
      countConditions.push(`brand = $${countParamCount}`);
      countValues.push(brand);
    }

    if (condition) {
      countParamCount++;
      countConditions.push(`condition = $${countParamCount}`);
      countValues.push(condition);
    }

    if (pricePeriod) {
      countParamCount++;
      countConditions.push(`price_period = $${countParamCount}`);
      countValues.push(pricePeriod);
    }

    if (delivery === "true") {
      countParamCount++;
      countConditions.push(`delivery = $${countParamCount}`);
      countValues.push(true);
    }

    if (availableFrom) {
      countParamCount++;
      countConditions.push(`available_from >= $${countParamCount}`);
      countValues.push(availableFrom);
    }

    if (availableTo) {
      countParamCount++;
      countConditions.push(`available_to <= $${countParamCount}`);
      countValues.push(availableTo);
    }

    if (search) {
      countParamCount++;
      countConditions.push(
        `(title ILIKE $${countParamCount} OR description ILIKE $${countParamCount} OR location ILIKE $${countParamCount} OR brand ILIKE $${countParamCount})`
      );
      countValues.push(`%${search}%`);
    }

    if (minPrice) {
      countParamCount++;
      countConditions.push(`price >= $${countParamCount}`);
      countValues.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      countParamCount++;
      countConditions.push(`price <= $${countParamCount}`);
      countValues.push(parseFloat(maxPrice));
    }

    if (countConditions.length > 0) {
      countQuery += ` AND ${countConditions.join(" AND ")}`;
    }

    const countResult = await db.query(countQuery, countValues);
    const totalCount = parseInt(countResult.rows[0].count);

    res.status(200).json({
      success: true,
      count: totalCount,
      data: listings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get listings count only (optimized for dashboard)
 * @route   GET /api/listings/count
 * @access  Private (vendors get their count, admins get all count)
 */
exports.getListingsCount = async (req, res) => {
  try {
    // Check if user is authenticated and is a vendor
    const isVendorRequest =
      req.user && req.user.user_type === "vendor" && req.userTable === "users";

    // Build count query
    let countQuery =
      "SELECT COUNT(*) as total FROM listings WHERE owner_type = 'user'";
    const countValues = [];

    // If authenticated vendor, filter by their listings only
    if (isVendorRequest) {
      countQuery += " AND owner_id = $1";
      countValues.push(req.user.id);
    }

    const result = await db.query(countQuery, countValues);
    const count = parseInt(result.rows[0].total);

    res.status(200).json({
      success: true,
      count: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single listing
 * @route   GET /api/listings/:id
 * @access  Public
 */
exports.getListing = async (req, res) => {
  try {
    const query = `
      SELECT
        l.*,
        c.id as category_id_info, c.name as category_name, c.slug as category_slug,
        c.description as category_description, c.image_url as category_image_url
      FROM listings l
      LEFT JOIN categories c ON l.category_id = c.id
      WHERE l.id = $1
    `;

    const result = await db.query(query, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Listing not found with id of ${req.params.id}`,
      });
    }

    const listing = result.rows[0];
    const formattedListing = {
      ...listing,
      images:
        typeof listing.images === "string"
          ? JSON.parse(listing.images)
          : listing.images,
      specifications:
        typeof listing.specifications === "string"
          ? JSON.parse(listing.specifications)
          : listing.specifications,
      category: listing.category_id_info
        ? {
            id: listing.category_id_info,
            name: listing.category_name,
            slug: listing.category_slug,
            description: listing.category_description,
            image_url: listing.category_image_url,
          }
        : null,
      // Remove the separate category fields
      category_id_info: undefined,
      category_name: undefined,
      category_slug: undefined,
      category_description: undefined,
      category_image_url: undefined,
    };

    res.status(200).json({
      success: true,
      data: formattedListing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new listing
 * @route   POST /api/listings
 * @access  Private
 */
exports.createListing = async (req, res) => {
  try {
    console.log("=== RAW REQUEST BODY ===");
    console.log("Type:", typeof req.body);
    console.log("Content:", JSON.stringify(req.body, null, 2));
    console.log("Images raw:", req.body.images);
    console.log("Images type:", typeof req.body.images);
    console.log("========================");

    const {
      title,
      description,
      price,
      category_id,
      // user_id,
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

    // Sanitize and validate images field
    let sanitizedImages = [];
    if (images) {
      if (Array.isArray(images)) {
        sanitizedImages = images;
      } else if (typeof images === "string") {
        try {
          const parsed = JSON.parse(images);
          sanitizedImages = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.error("Error parsing images string:", e);
          sanitizedImages = [];
        }
      } else if (typeof images === "object") {
        // If it's an object, convert to array of values
        sanitizedImages = Object.values(images).filter(
          (val) => typeof val === "string"
        );
      }
    }

    // Sanitize and validate specifications field
    let sanitizedSpecifications = [];
    if (specifications) {
      if (Array.isArray(specifications)) {
        sanitizedSpecifications = specifications;
      } else if (typeof specifications === "string") {
        try {
          const parsed = JSON.parse(specifications);
          sanitizedSpecifications = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.error("Error parsing specifications string:", e);
          sanitizedSpecifications = [];
        }
      } else if (typeof specifications === "object") {
        // If it's an object, convert to array
        sanitizedSpecifications = Object.values(specifications).filter(
          (val) => val && typeof val === "object"
        );
      }
    }

    console.log("Sanitized images:", sanitizedImages);
    console.log("Sanitized specifications:", sanitizedSpecifications);

    // Validation
    if (!title || !description || !price || !category_id || !location) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide title, description, price, category_id, and location",
      });
    }

    // Check if user exists and is a vendor (if auth is implemented)
    if (req.user) {
      const userQuery = await db.query(
        "SELECT id, user_type, status FROM users WHERE id = $1",
        [req.user.id]
      );

      if (userQuery.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const user = userQuery.rows[0];

      // Check if user is a vendor
      if (user.user_type !== "vendor") {
        return res.status(403).json({
          success: false,
          message: "Only vendors can create listings",
        });
      }

      // Check if user is active
      if (user.status !== "active") {
        return res.status(403).json({
          success: false,
          message: "User account is not active",
        });
      }

      // Validate plan requirements for listing creation
      const planValidation = await validateListingCreation(
        req.user.id,
        is_featured
      );

      if (!planValidation.canCreate) {
        return res.status(403).json({
          success: false,
          message: planValidation.reason,
        });
      }
    }

    // Create the listing
    const listingData = {
      title,
      description,
      price: parseFloat(price).toFixed(2),
      category_id,
      location,
      status,
      is_featured,
      images: JSON.stringify(sanitizedImages),
      owner_id: req.user ? req.user.id : null, // Vendor user ID from users table
      owner_type: "user", // Polymorphic type for vendor users
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      brand,
      condition,
      specifications: JSON.stringify(sanitizedSpecifications),
      price_period,
      deposit: deposit ? parseFloat(deposit).toFixed(2) : 0,
      min_duration: parseInt(min_duration) || 1,
      available_from,
      available_to,
      delivery,
      shipping: shipping ? parseFloat(shipping).toFixed(2) : 0,
      video,
      rental_terms,
      accept_deposit,
      cancellation,
      notes,
    };

    // Generate UUID for the listing
    const listingId = uuidv4();
    listingData.id = listingId;

    // Insert the listing
    const insertedListing = await db.insert("listings", listingData);

    if (!insertedListing) {
      throw new Error("Failed to create listing");
    }

    // Get the created listing with category information
    const query = `
      SELECT
        l.*,
        c.id as category_id_info, c.name as category_name, c.slug as category_slug,
        c.description as category_description, c.image_url as category_image_url
      FROM listings l
      LEFT JOIN categories c ON l.category_id = c.id
      WHERE l.id = $1
    `;

    const result = await db.query(query, [listingId]);
    const listing = result.rows[0];

    const formattedListing = {
      ...listing,
      images:
        typeof listing.images === "string"
          ? JSON.parse(listing.images)
          : listing.images,
      specifications:
        typeof listing.specifications === "string"
          ? JSON.parse(listing.specifications)
          : listing.specifications,
      category: listing.category_id_info
        ? {
            id: listing.category_id_info,
            name: listing.category_name,
            slug: listing.category_slug,
            description: listing.category_description,
            image_url: listing.category_image_url,
          }
        : null,
      // Remove the separate category fields
      category_id_info: undefined,
      category_name: undefined,
      category_slug: undefined,
      category_description: undefined,
      category_image_url: undefined,
    };

    res.status(201).json({
      success: true,
      data: formattedListing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Update listing
 * @route   PUT /api/listings/:id
 * @access  Private
 */
exports.updateListing = async (req, res) => {
  try {
    // Check if listing exists and get current data
    const existingListingQuery = await db.query(
      "SELECT id, owner_id, owner_type, is_featured FROM listings WHERE id = $1",
      [req.params.id]
    );

    if (existingListingQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Listing not found with id of ${req.params.id}`,
      });
    }

    const existingListing = existingListingQuery.rows[0];

    // Authorization check: Allow owner, admin, or super_admin to update
    if (req.user) {
      const isOwner =
        req.user.id === existingListing.owner_id &&
        req.userTable === "users" &&
        existingListing.owner_type === "user";
      const isAdmin =
        req.user.user_type === "admin" || req.user.user_type === "super_admin";
      const isFromAdminTable = req.userTable === "admin_users";

      // Allow if user is owner (vendor), or if user is admin/super_admin from admin_users table
      if (!isOwner && !(isAdmin && isFromAdminTable)) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this listing",
        });
      }

      // Validate plan requirements for featured status changes (only for vendors, not admins)
      if (isOwner && req.body.hasOwnProperty("is_featured")) {
        const currentIsFeatured = existingListing.is_featured || false;
        const newIsFeatured = req.body.is_featured || false;

        const updateValidation = await validateListingUpdate(
          req.user.id,
          currentIsFeatured,
          newIsFeatured
        );

        if (!updateValidation.canUpdate) {
          return res.status(403).json({
            success: false,
            message: updateValidation.reason,
          });
        }
      }
    }

    // Update the listing
    const updateData = { ...req.body };
    updateData.updated_at = new Date().toISOString();

    // Handle numeric conversions if they're strings
    if (updateData.price) {
      updateData.price = parseFloat(updateData.price).toFixed(2);
    }

    if (updateData.deposit) {
      updateData.deposit = parseFloat(updateData.deposit).toFixed(2);
    }

    if (updateData.shipping) {
      updateData.shipping = parseFloat(updateData.shipping).toFixed(2);
    }

    if (updateData.min_duration) {
      updateData.min_duration = parseInt(updateData.min_duration);
    }

    // Handle JSON fields
    if (updateData.images && typeof updateData.images !== "string") {
      updateData.images = JSON.stringify(updateData.images);
    }

    if (
      updateData.specifications &&
      typeof updateData.specifications !== "string"
    ) {
      updateData.specifications = JSON.stringify(updateData.specifications);
    }

    // Remove undefined values and prepare update data
    const cleanUpdateData = {};
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        cleanUpdateData[key] = updateData[key];
      }
    });

    // Update the listing
    const updatedListing = await db.update(
      "listings",
      req.params.id,
      cleanUpdateData
    );

    if (!updatedListing) {
      return res.status(404).json({
        success: false,
        message: `Listing not found with id of ${req.params.id}`,
      });
    }

    // Get updated listing with category information
    const query = `
      SELECT
        l.*,
        c.id as category_id_info, c.name as category_name, c.slug as category_slug,
        c.description as category_description, c.image_url as category_image_url
      FROM listings l
      LEFT JOIN categories c ON l.category_id = c.id
      WHERE l.id = $1
    `;

    const result = await db.query(query, [req.params.id]);
    const listing = result.rows[0];

    const formattedListing = {
      ...listing,
      images:
        typeof listing.images === "string"
          ? JSON.parse(listing.images)
          : listing.images,
      specifications:
        typeof listing.specifications === "string"
          ? JSON.parse(listing.specifications)
          : listing.specifications,
      category: listing.category_id_info
        ? {
            id: listing.category_id_info,
            name: listing.category_name,
            slug: listing.category_slug,
            description: listing.category_description,
            image_url: listing.category_image_url,
          }
        : null,
      // Remove the separate category fields
      category_id_info: undefined,
      category_name: undefined,
      category_slug: undefined,
      category_description: undefined,
      category_image_url: undefined,
    };

    res.status(200).json({
      success: true,
      data: formattedListing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete listing
 * @route   DELETE /api/listings/:id
 * @access  Private
 */
exports.deleteListing = async (req, res) => {
  try {
    // Check if listing exists
    const listingQuery = await db.query(
      "SELECT id, owner_id, owner_type FROM listings WHERE id = $1",
      [req.params.id]
    );

    if (listingQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Listing not found with id of ${req.params.id}`,
      });
    }

    const listing = listingQuery.rows[0];

    // Authorization check: Allow owner, admin, or super_admin to delete
    if (req.user) {
      const isOwner =
        req.user.id === listing.owner_id &&
        req.userTable === "users" &&
        listing.owner_type === "user";
      const isAdmin =
        req.user.user_type === "admin" || req.user.user_type === "super_admin";
      const isFromAdminTable = req.userTable === "admin_users";

      // Allow if user is owner (vendor), or if user is admin/super_admin from admin_users table
      if (!isOwner && !(isAdmin && isFromAdminTable)) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this listing",
        });
      }
    }

    // Delete the listing
    const deletedListing = await db.delete("listings", req.params.id);

    if (!deletedListing) {
      throw new Error("Failed to delete listing");
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

/**
 * @desc    Get featured listings
 * @route   GET /api/listings/featured
 * @access  Public
 */
exports.getFeaturedListings = async (req, res) => {
  try {
    const limit = req.query.limit || 8;

    const query = `
      SELECT
        l.*,
        c.id as category_id_info, c.name as category_name, c.slug as category_slug,
        c.description as category_description, c.image_url as category_image_url
      FROM listings l
      LEFT JOIN categories c ON l.category_id = c.id
      WHERE l.is_featured = true
        AND l.status = 'active'
        AND l.owner_type = 'user'
      ORDER BY l.created_at DESC
      LIMIT $1
    `;

    const result = await db.query(query, [parseInt(limit)]);
    const listings = result.rows.map((row) => ({
      ...row,
      images:
        typeof row.images === "string" ? JSON.parse(row.images) : row.images,
      specifications:
        typeof row.specifications === "string"
          ? JSON.parse(row.specifications)
          : row.specifications,
      category: row.category_id_info
        ? {
            id: row.category_id_info,
            name: row.category_name,
            slug: row.category_slug,
            description: row.category_description,
            image_url: row.category_image_url,
          }
        : null,
      // Remove the separate category fields
      category_id_info: undefined,
      category_name: undefined,
      category_slug: undefined,
      category_description: undefined,
      category_image_url: undefined,
    }));

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get listings by vendor
 * @route   GET /api/listings/vendor/:userId
 * @access  Public
 */
exports.getListingsByVendor = async (req, res) => {
  try {
    const query = `
      SELECT
        l.*,
        c.id as category_id_info, c.name as category_name, c.slug as category_slug,
        c.description as category_description, c.image_url as category_image_url
      FROM listings l
      LEFT JOIN categories c ON l.category_id = c.id
      WHERE l.owner_id = $1
        AND l.owner_type = 'user'
        AND l.status = 'active'
      ORDER BY l.created_at DESC
    `;

    const result = await db.query(query, [req.params.userId]);
    const listings = result.rows.map((row) => ({
      ...row,
      images:
        typeof row.images === "string" ? JSON.parse(row.images) : row.images,
      specifications:
        typeof row.specifications === "string"
          ? JSON.parse(row.specifications)
          : row.specifications,
      category: row.category_id_info
        ? {
            id: row.category_id_info,
            name: row.category_name,
            slug: row.category_slug,
            description: row.category_description,
            image_url: row.category_image_url,
          }
        : null,
      // Remove the separate category fields
      category_id_info: undefined,
      category_name: undefined,
      category_slug: undefined,
      category_description: undefined,
      category_image_url: undefined,
    }));

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get listings by category
 * @route   GET /api/listings/category/:categoryId
 * @access  Public
 */
exports.getListingsByCategory = async (req, res) => {
  try {
    const query = `
      SELECT
        l.*,
        c.id as category_id_info, c.name as category_name, c.slug as category_slug,
        c.description as category_description, c.image_url as category_image_url
      FROM listings l
      LEFT JOIN categories c ON l.category_id = c.id
      WHERE l.category_id = $1
        AND l.status = 'active'
        AND l.owner_type = 'user'
      ORDER BY l.created_at DESC
    `;

    const result = await db.query(query, [req.params.categoryId]);
    const listings = result.rows.map((row) => ({
      ...row,
      images:
        typeof row.images === "string" ? JSON.parse(row.images) : row.images,
      specifications:
        typeof row.specifications === "string"
          ? JSON.parse(row.specifications)
          : row.specifications,
      category: row.category_id_info
        ? {
            id: row.category_id_info,
            name: row.category_name,
            slug: row.category_slug,
            description: row.category_description,
            image_url: row.category_image_url,
          }
        : null,
      // Remove the separate category fields
      category_id_info: undefined,
      category_name: undefined,
      category_slug: undefined,
      category_description: undefined,
      category_image_url: undefined,
    }));

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get listing counts for multiple categories in batch
 * @route   POST /api/listings/category-counts
 * @access  Public
 */
exports.getBatchCategoryCounts = async (req, res) => {
  try {
    const { categoryIds } = req.body;

    if (
      !categoryIds ||
      !Array.isArray(categoryIds) ||
      categoryIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "categoryIds array is required",
      });
    }

    // Build query to get counts for all categories at once
    const placeholders = categoryIds
      .map((_, index) => `$${index + 1}`)
      .join(",");
    const query = `
      SELECT
        category_id,
        COUNT(*) as listing_count
      FROM listings
      WHERE category_id IN (${placeholders})
        AND status = 'active'
        AND owner_type = 'user'
      GROUP BY category_id
    `;

    const result = await db.query(query, categoryIds);

    // Create a map with all requested categories, defaulting to 0 count
    const countsMap = {};
    categoryIds.forEach((id) => {
      countsMap[id] = 0;
    });

    // Update with actual counts from database
    result.rows.forEach((row) => {
      countsMap[row.category_id] = parseInt(row.listing_count);
    });

    res.status(200).json({
      success: true,
      data: countsMap,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
