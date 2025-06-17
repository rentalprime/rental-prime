const db = require("../config/database");
const { v4: uuidv4 } = require("uuid");

/**
 * @desc    Get all categories with optional filtering
 * @route   GET /api/categories
 * @access  Public
 */
exports.getCategories = async (req, res) => {
  try {
    const {
      status,
      parent_id,
      search,
      limit = 50,
      offset = 0,
      orderBy = "created_at",
      orderDirection = "desc",
    } = req.query;

    // Build the base query with parent and children information
    let queryText = `
      SELECT
        c.*,
        p.id as parent_id_info, p.name as parent_name, p.slug as parent_slug,
        COALESCE(
          json_agg(
            CASE WHEN ch.id IS NOT NULL THEN
              json_build_object('id', ch.id, 'name', ch.name, 'slug', ch.slug, 'status', ch.status)
            END
          ) FILTER (WHERE ch.id IS NOT NULL),
          '[]'::json
        ) as children
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      LEFT JOIN categories ch ON ch.parent_id = c.id
    `;

    const conditions = [];
    const values = [];
    let paramCount = 0;

    // Apply filters if provided
    if (status && status !== "all") {
      paramCount++;
      conditions.push(`c.status = $${paramCount}`);
      values.push(status);
    }

    // Filter by parent category
    if (parent_id) {
      if (parent_id === "null" || parent_id === "root") {
        conditions.push(`c.parent_id IS NULL`);
      } else {
        paramCount++;
        conditions.push(`c.parent_id = $${paramCount}`);
        values.push(parent_id);
      }
    }

    // Search functionality
    if (search) {
      paramCount++;
      conditions.push(
        `(c.name ILIKE $${paramCount} OR c.description ILIKE $${paramCount} OR c.slug ILIKE $${paramCount})`
      );
      values.push(`%${search}%`);
    }

    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      queryText += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Add GROUP BY
    queryText += ` GROUP BY c.id, p.id, p.name, p.slug`;

    // Ordering
    const validOrderFields = ["name", "created_at", "updated_at", "status"];
    const orderField = validOrderFields.includes(orderBy)
      ? orderBy
      : "created_at";
    const direction = orderDirection === "asc" ? "ASC" : "DESC";
    queryText += ` ORDER BY c.${orderField} ${direction}`;

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

    // Execute query
    const result = await db.query(queryText, values);
    const categories = result.rows.map((row) => ({
      ...row,
      parent: row.parent_id_info
        ? {
            id: row.parent_id_info,
            name: row.parent_name,
            slug: row.parent_slug,
          }
        : null,
      // Remove the separate parent fields
      parent_id_info: undefined,
      parent_name: undefined,
      parent_slug: undefined,
    }));

    // Get total count for pagination (simplified count query)
    let countQuery = "SELECT COUNT(*) FROM categories c";
    const countConditions = [];
    const countValues = [];
    let countParamCount = 0;

    // Apply same filters for count
    if (status && status !== "all") {
      countParamCount++;
      countConditions.push(`c.status = $${countParamCount}`);
      countValues.push(status);
    }

    if (parent_id) {
      if (parent_id === "null" || parent_id === "root") {
        countConditions.push(`c.parent_id IS NULL`);
      } else {
        countParamCount++;
        countConditions.push(`c.parent_id = $${countParamCount}`);
        countValues.push(parent_id);
      }
    }

    if (search) {
      countParamCount++;
      countConditions.push(
        `(c.name ILIKE $${countParamCount} OR c.description ILIKE $${countParamCount} OR c.slug ILIKE $${countParamCount})`
      );
      countValues.push(`%${search}%`);
    }

    if (countConditions.length > 0) {
      countQuery += ` WHERE ${countConditions.join(" AND ")}`;
    }

    const countResult = await db.query(countQuery, countValues);
    const totalCount = parseInt(countResult.rows[0].count);

    res.status(200).json({
      success: true,
      count: categories.length,
      total: totalCount,
      data: categories,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit)),
        currentPage: Math.floor(parseInt(offset) / parseInt(limit)) + 1,
      },
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
 * @desc    Get single category by ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
exports.getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Get category with parent and children information
    const queryText = `
      SELECT
        c.*,
        p.id as parent_id_info, p.name as parent_name, p.slug as parent_slug, p.description as parent_description,
        COALESCE(
          json_agg(
            CASE WHEN ch.id IS NOT NULL THEN
              json_build_object(
                'id', ch.id,
                'name', ch.name,
                'slug', ch.slug,
                'status', ch.status,
                'description', ch.description,
                'image_url', ch.image_url
              )
            END
          ) FILTER (WHERE ch.id IS NOT NULL),
          '[]'::json
        ) as children
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      LEFT JOIN categories ch ON ch.parent_id = c.id
      WHERE c.id = $1
      GROUP BY c.id, p.id, p.name, p.slug, p.description
    `;

    const result = await db.query(queryText, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Category not found with id of ${id}`,
      });
    }

    const category = {
      ...result.rows[0],
      parent: result.rows[0].parent_id_info
        ? {
            id: result.rows[0].parent_id_info,
            name: result.rows[0].parent_name,
            slug: result.rows[0].parent_slug,
            description: result.rows[0].parent_description,
          }
        : null,
      // Remove the separate parent fields
      parent_id_info: undefined,
      parent_name: undefined,
      parent_slug: undefined,
      parent_description: undefined,
    };

    res.status(200).json({
      success: true,
      data: category,
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
 * @desc    Create new category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
exports.createCategory = async (req, res) => {
  try {
    const {
      name,
      description,
      image_url,
      status = "active",
      parent_id,
      slug,
    } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Please provide a category name",
      });
    }

    // Generate slug if not provided
    let categorySlug = slug;
    if (!categorySlug) {
      categorySlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Check if slug already exists
    const existingCategoryResult = await db.query(
      "SELECT id FROM categories WHERE slug = $1",
      [categorySlug]
    );

    if (existingCategoryResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Category with this slug already exists",
      });
    }

    // Validate parent_id if provided
    if (parent_id) {
      const parentResult = await db.query(
        "SELECT id FROM categories WHERE id = $1",
        [parent_id]
      );

      if (parentResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid parent category ID",
        });
      }
    }

    // Create category data
    const categoryId = uuidv4();
    const categoryData = {
      id: categoryId,
      name: name.trim(),
      description: description?.trim() || null,
      image_url: image_url || null,
      status,
      parent_id: parent_id || null,
      slug: categorySlug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert the category
    const insertResult = await db.insert("categories", categoryData);

    // Get the created category with parent and children information
    const queryText = `
      SELECT
        c.*,
        p.id as parent_id_info, p.name as parent_name, p.slug as parent_slug,
        COALESCE(
          json_agg(
            CASE WHEN ch.id IS NOT NULL THEN
              json_build_object('id', ch.id, 'name', ch.name, 'slug', ch.slug, 'status', ch.status)
            END
          ) FILTER (WHERE ch.id IS NOT NULL),
          '[]'::json
        ) as children
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      LEFT JOIN categories ch ON ch.parent_id = c.id
      WHERE c.id = $1
      GROUP BY c.id, p.id, p.name, p.slug
    `;

    const result = await db.query(queryText, [categoryId]);
    const category = {
      ...result.rows[0],
      parent: result.rows[0].parent_id_info
        ? {
            id: result.rows[0].parent_id_info,
            name: result.rows[0].parent_name,
            slug: result.rows[0].parent_slug,
          }
        : null,
      // Remove the separate parent fields
      parent_id_info: undefined,
      parent_name: undefined,
      parent_slug: undefined,
    };

    res.status(201).json({
      success: true,
      data: category,
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
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image_url, status, parent_id, slug } = req.body;

    // Check if category exists
    const existingCategoryResult = await db.query(
      "SELECT * FROM categories WHERE id = $1",
      [id]
    );

    if (existingCategoryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Category not found with id of ${id}`,
      });
    }

    const existingCategory = existingCategoryResult.rows[0];

    // Prepare update data
    const updateData = {};

    // Update name if provided
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category name cannot be empty",
        });
      }
      updateData.name = name.trim();
    }

    // Update description if provided
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    // Update image_url if provided
    if (image_url !== undefined) {
      updateData.image_url = image_url || null;
    }

    // Update status if provided
    if (status !== undefined) {
      const validStatuses = ["active", "inactive"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be either "active" or "inactive"',
        });
      }
      updateData.status = status;
    }

    // Update slug if provided OR if name is being updated
    let newSlug = null;
    if (slug !== undefined) {
      // Use provided slug
      newSlug = slug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    } else if (name !== undefined) {
      // Auto-generate slug from new name
      newSlug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // If we have a new slug, validate it's unique
    if (newSlug) {
      // Check if new slug already exists (excluding current category)
      const slugExistsResult = await db.query(
        "SELECT id FROM categories WHERE slug = $1 AND id != $2",
        [newSlug, id]
      );

      if (slugExistsResult.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Category with this slug already exists",
        });
      }

      updateData.slug = newSlug;
    }

    // Update parent_id if provided
    if (parent_id !== undefined) {
      if (parent_id === null || parent_id === "") {
        updateData.parent_id = null;
      } else {
        // Validate parent_id exists
        const parentResult = await db.query(
          "SELECT id FROM categories WHERE id = $1",
          [parent_id]
        );

        if (parentResult.rows.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid parent category ID",
          });
        }

        // Prevent circular reference (category cannot be its own parent or descendant)
        if (parent_id === id) {
          return res.status(400).json({
            success: false,
            message: "Category cannot be its own parent",
          });
        }

        updateData.parent_id = parent_id;
      }
    }

    // Update the category
    const updatedCategory = await db.update("categories", id, updateData);

    // Get the updated category with parent and children information
    const queryText = `
      SELECT
        c.*,
        p.id as parent_id_info, p.name as parent_name, p.slug as parent_slug,
        COALESCE(
          json_agg(
            CASE WHEN ch.id IS NOT NULL THEN
              json_build_object('id', ch.id, 'name', ch.name, 'slug', ch.slug, 'status', ch.status)
            END
          ) FILTER (WHERE ch.id IS NOT NULL),
          '[]'::json
        ) as children
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      LEFT JOIN categories ch ON ch.parent_id = c.id
      WHERE c.id = $1
      GROUP BY c.id, p.id, p.name, p.slug
    `;

    const result = await db.query(queryText, [id]);
    const category = {
      ...result.rows[0],
      parent: result.rows[0].parent_id_info
        ? {
            id: result.rows[0].parent_id_info,
            name: result.rows[0].parent_name,
            slug: result.rows[0].parent_slug,
          }
        : null,
      // Remove the separate parent fields
      parent_id_info: undefined,
      parent_name: undefined,
      parent_slug: undefined,
    };

    res.status(200).json({
      success: true,
      data: category,
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
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { force = false } = req.query; // Optional force delete parameter

    // Check if category exists
    const existingCategoryResult = await db.query(
      "SELECT * FROM categories WHERE id = $1",
      [id]
    );

    if (existingCategoryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Category not found with id of ${id}`,
      });
    }

    // Check if category has children
    const childrenResult = await db.query(
      "SELECT id FROM categories WHERE parent_id = $1",
      [id]
    );

    const children = childrenResult.rows;

    if (children && children.length > 0 && !force) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete category with subcategories. Use force=true to delete all subcategories.",
        subcategories: children.length,
      });
    }

    // If force delete, first delete all children recursively
    if (force && children && children.length > 0) {
      for (const child of children) {
        await deleteRecursive(child.id);
      }
    }

    // Delete the category
    await db.delete("categories", id);

    res.status(200).json({
      success: true,
      data: {},
      message: "Category deleted successfully",
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
 * Helper function to recursively delete categories and their children
 */
async function deleteRecursive(categoryId) {
  // Get children of this category
  const childrenResult = await db.query(
    "SELECT id FROM categories WHERE parent_id = $1",
    [categoryId]
  );

  const children = childrenResult.rows;

  // Recursively delete children first
  if (children && children.length > 0) {
    for (const child of children) {
      await deleteRecursive(child.id);
    }
  }

  // Delete this category
  await db.delete("categories", categoryId);
}

/**
 * @desc    Get category hierarchy (tree structure)
 * @route   GET /api/categories/hierarchy
 * @access  Public
 */
exports.getCategoryHierarchy = async (req, res) => {
  try {
    const { status = "active" } = req.query;

    // Get all categories
    let queryText = "SELECT * FROM categories";
    const values = [];

    if (status && status !== "all") {
      queryText += " WHERE status = $1";
      values.push(status);
    }

    queryText += " ORDER BY name ASC";

    const result = await db.query(queryText, values);
    const categories = result.rows;

    // Build hierarchy tree
    const categoryMap = new Map();
    const rootCategories = [];

    // First pass: create map of all categories
    categories.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Second pass: build tree structure
    categories.forEach((category) => {
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children.push(categoryMap.get(category.id));
        }
      } else {
        rootCategories.push(categoryMap.get(category.id));
      }
    });

    res.status(200).json({
      success: true,
      data: rootCategories,
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
 * @desc    Get category by slug
 * @route   GET /api/categories/slug/:slug
 * @access  Public
 */
exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Get category with parent and children information
    const queryText = `
      SELECT
        c.*,
        p.id as parent_id_info, p.name as parent_name, p.slug as parent_slug, p.description as parent_description,
        COALESCE(
          json_agg(
            CASE WHEN ch.id IS NOT NULL THEN
              json_build_object(
                'id', ch.id,
                'name', ch.name,
                'slug', ch.slug,
                'status', ch.status,
                'description', ch.description,
                'image_url', ch.image_url
              )
            END
          ) FILTER (WHERE ch.id IS NOT NULL),
          '[]'::json
        ) as children
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      LEFT JOIN categories ch ON ch.parent_id = c.id
      WHERE c.slug = $1
      GROUP BY c.id, p.id, p.name, p.slug, p.description
    `;

    const result = await db.query(queryText, [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Category not found with slug: ${slug}`,
      });
    }

    const category = {
      ...result.rows[0],
      parent: result.rows[0].parent_id_info
        ? {
            id: result.rows[0].parent_id_info,
            name: result.rows[0].parent_name,
            slug: result.rows[0].parent_slug,
            description: result.rows[0].parent_description,
          }
        : null,
      // Remove the separate parent fields
      parent_id_info: undefined,
      parent_name: undefined,
      parent_slug: undefined,
      parent_description: undefined,
    };

    res.status(200).json({
      success: true,
      data: category,
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
 * @desc    Get category statistics
 * @route   GET /api/categories/stats
 * @access  Private/Admin
 */
exports.getCategoryStats = async (req, res) => {
  try {
    // Get total categories count
    const totalResult = await db.query("SELECT COUNT(*) FROM categories");
    const totalCategories = parseInt(totalResult.rows[0].count);

    // Get active categories count
    const activeResult = await db.query(
      "SELECT COUNT(*) FROM categories WHERE status = $1",
      ["active"]
    );
    const activeCategories = parseInt(activeResult.rows[0].count);

    // Get root categories count
    const rootResult = await db.query(
      "SELECT COUNT(*) FROM categories WHERE parent_id IS NULL"
    );
    const rootCategories = parseInt(rootResult.rows[0].count);

    // Get categories with children count
    const categoriesResult = await db.query(
      "SELECT id, parent_id FROM categories"
    );
    const categoriesWithChildren = categoriesResult.rows;

    const parentIds = new Set(
      categoriesWithChildren
        .filter((cat) => cat.parent_id)
        .map((cat) => cat.parent_id)
    );

    res.status(200).json({
      success: true,
      data: {
        total: totalCategories,
        active: activeCategories,
        inactive: totalCategories - activeCategories,
        root: rootCategories,
        withChildren: parentIds.size,
        withoutChildren: totalCategories - parentIds.size,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
