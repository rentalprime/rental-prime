const db = require("../config/database");

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

    // Build the PostgreSQL query with category information
    let queryText = `
      SELECT
        l.*,
        c.id as category_id_info, c.name as category_name, c.slug as category_slug,
        c.description as category_description, c.image_url as category_image_url
      FROM listings l
      LEFT JOIN categories c ON l.category_id = c.id
      WHERE 1=1
    `;

    const queryParams = [];
    let paramCount = 0;

    // Apply filters
    if (status && status !== "all") {
      paramCount++;
      queryText += ` AND l.status = $${paramCount}`;
      queryParams.push(status);
    }

    if (category && category !== "all") {
      paramCount++;
      queryText += ` AND l.category_id = $${paramCount}`;
      queryParams.push(category);
    }

    if (is_featured === "true") {
      queryText += ` AND l.is_featured = true`;
    }

    if (brand) {
      paramCount++;
      queryText += ` AND l.brand = $${paramCount}`;
      queryParams.push(brand);
    }

    if (condition) {
      paramCount++;
      queryText += ` AND l.condition = $${paramCount}`;
      queryParams.push(condition);
    }

    if (pricePeriod) {
      paramCount++;
      queryText += ` AND l.price_period = $${paramCount}`;
      queryParams.push(pricePeriod);
    }

    if (delivery === "true") {
      queryText += ` AND l.delivery = true`;
    }

    if (availableFrom) {
      paramCount++;
      queryText += ` AND l.available_from >= $${paramCount}`;
      queryParams.push(availableFrom);
    }

    if (availableTo) {
      paramCount++;
      queryText += ` AND l.available_to <= $${paramCount}`;
      queryParams.push(availableTo);
    }

    if (search) {
      paramCount++;
      queryText += ` AND (l.title ILIKE $${paramCount} OR l.description ILIKE $${paramCount} OR l.location ILIKE $${paramCount} OR l.brand ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (minPrice) {
      paramCount++;
      queryText += ` AND l.price >= $${paramCount}`;
      queryParams.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      paramCount++;
      queryText += ` AND l.price <= $${paramCount}`;
      queryParams.push(parseFloat(maxPrice));
    }

    // Add ordering
    const validOrderBy = ["created_at", "updated_at", "price", "title"];
    const safeOrderBy = validOrderBy.includes(orderBy) ? orderBy : "created_at";
    const safeOrderDirection = orderDirection === "asc" ? "ASC" : "DESC";
    queryText += ` ORDER BY l.${safeOrderBy} ${safeOrderDirection}`;

    // Add pagination
    if (limit) {
      paramCount++;
      queryText += ` LIMIT $${paramCount}`;
      queryParams.push(parseInt(limit));
    }

    if (offset) {
      paramCount++;
      queryText += ` OFFSET $${paramCount}`;
      queryParams.push(parseInt(offset));
    }

    const result = await db.query(queryText, queryParams);
    const listings = result.rows.map((row) => ({
      ...row,
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

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM listings l
      WHERE 1=1
    `;
    const countParams = [];
    let countParamCount = 0;

    // Apply same filters for count
    if (status && status !== "all") {
      countParamCount++;
      countQuery += ` AND l.status = $${countParamCount}`;
      countParams.push(status);
    }

    if (category && category !== "all") {
      countParamCount++;
      countQuery += ` AND l.category_id = $${countParamCount}`;
      countParams.push(category);
    }

    if (is_featured === "true") {
      countQuery += ` AND l.is_featured = true`;
    }

    if (brand) {
      countParamCount++;
      countQuery += ` AND l.brand = $${countParamCount}`;
      countParams.push(brand);
    }

    if (condition) {
      countParamCount++;
      countQuery += ` AND l.condition = $${countParamCount}`;
      countParams.push(condition);
    }

    if (pricePeriod) {
      countParamCount++;
      countQuery += ` AND l.price_period = $${countParamCount}`;
      countParams.push(pricePeriod);
    }

    if (delivery === "true") {
      countQuery += ` AND l.delivery = true`;
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (l.title ILIKE $${countParamCount} OR l.description ILIKE $${countParamCount} OR l.location ILIKE $${countParamCount} OR l.brand ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    if (minPrice) {
      countParamCount++;
      countQuery += ` AND l.price >= $${countParamCount}`;
      countParams.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      countParamCount++;
      countQuery += ` AND l.price <= $${countParamCount}`;
      countParams.push(parseFloat(maxPrice));
    }

    const countResult = await db.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].total);

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

// @desc    Get single listing (Admin endpoint - can access all listings)
// @route   GET /api/admin/listings/:id
// @access  Private (Super Admin only)
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

    // Parse JSON fields if they're strings
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

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private (super_admin only)
exports.createListing = async (req, res) => {
  try {
    console.log("=== ADMIN RAW REQUEST BODY ===");
    console.log("Type:", typeof req.body);
    console.log("Content:", JSON.stringify(req.body, null, 2));
    console.log("Images raw:", req.body.images);
    console.log("Images type:", typeof req.body.images);
    console.log("==============================");

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

    console.log("Admin - Sanitized images:", sanitizedImages);
    console.log("Admin - Sanitized specifications:", sanitizedSpecifications);

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
    const adminUserQuery = await db.query(
      "SELECT id, user_type, status FROM admin_users WHERE id = $1",
      [req.user.id]
    );

    if (adminUserQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found",
      });
    }

    const adminUser = adminUserQuery.rows[0];

    // Check if admin user is active
    if (adminUser.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Admin account is not active",
      });
    }

    // Create the listing using PostgreSQL
    const listingData = {
      title,
      description,
      price: parseFloat(price),
      category_id,
      location,
      status,
      is_featured,
      images: JSON.stringify(sanitizedImages),
      owner_id: req.user.id, // Admin user ID from admin_users table
      owner_type: "admin_user", // Polymorphic type for admin users
      brand,
      condition,
      specifications: JSON.stringify(sanitizedSpecifications),
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

    const listing = await db.insert("listings", listingData);

    if (!listing) {
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

    const result = await db.query(query, [listing.id]);
    const createdListing = result.rows[0];

    const formattedListing = {
      ...createdListing,
      images:
        typeof createdListing.images === "string"
          ? JSON.parse(createdListing.images)
          : createdListing.images,
      specifications:
        typeof createdListing.specifications === "string"
          ? JSON.parse(createdListing.specifications)
          : createdListing.specifications,
      category: createdListing.category_id_info
        ? {
            id: createdListing.category_id_info,
            name: createdListing.category_name,
            slug: createdListing.category_slug,
            description: createdListing.category_description,
            image_url: createdListing.category_image_url,
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

// @desc    Update listing (Admin endpoint - can update all listings)
// @route   PUT /api/admin/listings/:id
// @access  Private (Super Admin only)
exports.updateListing = async (req, res) => {
  try {
    // Check if listing exists (admin can update any listing)
    const existingListingQuery = await db.query(
      "SELECT id, owner_id, owner_type FROM listings WHERE id = $1",
      [req.params.id]
    );

    if (existingListingQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Listing not found with id of ${req.params.id}`,
      });
    }

    const existingListing = existingListingQuery.rows[0];

    // Authorization check: Only super_admin can update listings via admin endpoint
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

    const isAdmin =
      req.user.user_type === "admin" || req.user.user_type === "super_admin";

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this listing",
      });
    }

    // Update the listing
    const updateData = { ...req.body };

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

    // Remove undefined values and system-managed fields
    const cleanUpdateData = {};
    Object.keys(updateData).forEach((key) => {
      // Skip system-managed fields that are handled automatically
      if (key === "updated_at" || key === "created_at" || key === "id") {
        return;
      }
      if (updateData[key] !== undefined) {
        cleanUpdateData[key] = updateData[key];
      }
    });

    console.log("=== UPDATE DEBUG ===");
    console.log("Original updateData keys:", Object.keys(updateData));
    console.log("Clean updateData keys:", Object.keys(cleanUpdateData));
    console.log(
      "Has updated_at in original:",
      updateData.hasOwnProperty("updated_at")
    );
    console.log(
      "Has updated_at in clean:",
      cleanUpdateData.hasOwnProperty("updated_at")
    );
    console.log("====================");

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

// @desc    Delete listing (Admin endpoint - can delete all listings)
// @route   DELETE /api/admin/listings/:id
// @access  Private (Super Admin only)
exports.deleteListing = async (req, res) => {
  try {
    // Check if listing exists (admin can delete any listing)
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

    // Authorization check: Only super_admin can delete listings via admin endpoint
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

    const isAdmin =
      req.user.user_type === "admin" || req.user.user_type === "super_admin";

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this listing",
      });
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

// @desc    Get featured listings
// @route   GET /api/listings/featured
// @access  Public
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
      WHERE l.is_featured = true AND l.status = 'active' AND l.owner_type = 'admin_user'
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
