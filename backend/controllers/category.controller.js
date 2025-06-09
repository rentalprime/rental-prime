const supabase = require("../config/supabase");
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

    // Start building the query
    let query = supabase.from("categories").select(`
        *,
        parent:parent_id(id, name, slug),
        children:categories!parent_id(id, name, slug, status)
      `);

    // Apply filters if provided
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    // Filter by parent category
    if (parent_id) {
      if (parent_id === "null" || parent_id === "root") {
        query = query.is("parent_id", null);
      } else {
        query = query.eq("parent_id", parent_id);
      }
    }

    // Search functionality
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%,slug.ilike.%${search}%`
      );
    }

    // Ordering
    const validOrderFields = ["name", "created_at", "updated_at", "status"];
    const orderField = validOrderFields.includes(orderBy)
      ? orderBy
      : "created_at";
    query = query.order(orderField, { ascending: orderDirection === "asc" });

    // Pagination
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    if (offset) {
      query = query.offset(parseInt(offset));
    }

    // Execute query
    const { data: categories, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from("categories")
      .select("*", { count: "exact", head: true });

    if (countError) {
      throw new Error(countError.message);
    }

    res.status(200).json({
      success: true,
      count: categories.length,
      total: count,
      data: categories,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: count,
        pages: Math.ceil(count / parseInt(limit)),
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

    const { data: category, error } = await supabase
      .from("categories")
      .select(
        `
        *,
        parent:parent_id(id, name, slug, description),
        children:categories!parent_id(id, name, slug, status, description, image_url)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: `Category not found with id of ${id}`,
      });
    }

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
    const { data: existingCategory, error: slugError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this slug already exists",
      });
    }

    // Validate parent_id if provided
    if (parent_id) {
      const { data: parentCategory, error: parentError } = await supabase
        .from("categories")
        .select("id")
        .eq("id", parent_id)
        .single();

      if (parentError || !parentCategory) {
        return res.status(400).json({
          success: false,
          message: "Invalid parent category ID",
        });
      }
    }

    // Create category data
    const categoryData = {
      id: uuidv4(),
      name: name.trim(),
      description: description?.trim() || null,
      image_url: image_url || null,
      status,
      parent_id: parent_id || null,
      slug: categorySlug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: category, error } = await supabase
      .from("categories")
      .insert([categoryData])
      .select(
        `
        *,
        parent:parent_id(id, name, slug),
        children:categories!parent_id(id, name, slug, status)
      `
      )
      .single();

    if (error) {
      throw new Error(error.message);
    }

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
    const { data: existingCategory, error: checkError } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (checkError || !existingCategory) {
      return res.status(404).json({
        success: false,
        message: `Category not found with id of ${id}`,
      });
    }

    // Prepare update data
    const updateData = {
      updated_at: new Date().toISOString(),
    };

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
      const { data: slugExists, error: slugError } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", newSlug)
        .neq("id", id)
        .single();

      if (slugExists) {
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
        const { data: parentCategory, error: parentError } = await supabase
          .from("categories")
          .select("id")
          .eq("id", parent_id)
          .single();

        if (parentError || !parentCategory) {
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
    const { data: category, error } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        parent:parent_id(id, name, slug),
        children:categories!parent_id(id, name, slug, status)
      `
      )
      .single();

    if (error) {
      throw new Error(error.message);
    }

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
    const { data: existingCategory, error: checkError } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (checkError || !existingCategory) {
      return res.status(404).json({
        success: false,
        message: `Category not found with id of ${id}`,
      });
    }

    // Check if category has children
    const { data: children, error: childrenError } = await supabase
      .from("categories")
      .select("id")
      .eq("parent_id", id);

    if (childrenError) {
      throw new Error(childrenError.message);
    }

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
    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

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
  const { data: children, error: childrenError } = await supabase
    .from("categories")
    .select("id")
    .eq("parent_id", categoryId);

  if (childrenError) {
    throw new Error(childrenError.message);
  }

  // Recursively delete children first
  if (children && children.length > 0) {
    for (const child of children) {
      await deleteRecursive(child.id);
    }
  }

  // Delete this category
  const { error: deleteError } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }
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
    let query = supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: categories, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

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

    const { data: category, error } = await supabase
      .from("categories")
      .select(
        `
        *,
        parent:parent_id(id, name, slug, description),
        children:categories!parent_id(id, name, slug, status, description, image_url)
      `
      )
      .eq("slug", slug)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: `Category not found with slug: ${slug}`,
      });
    }

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
    const { count: totalCategories, error: totalError } = await supabase
      .from("categories")
      .select("*", { count: "exact", head: true });

    if (totalError) {
      throw new Error(totalError.message);
    }

    // Get active categories count
    const { count: activeCategories, error: activeError } = await supabase
      .from("categories")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    if (activeError) {
      throw new Error(activeError.message);
    }

    // Get root categories count
    const { count: rootCategories, error: rootError } = await supabase
      .from("categories")
      .select("*", { count: "exact", head: true })
      .is("parent_id", null);

    if (rootError) {
      throw new Error(rootError.message);
    }

    // Get categories with children count
    const { data: categoriesWithChildren, error: childrenError } =
      await supabase.from("categories").select("id, parent_id");

    if (childrenError) {
      throw new Error(childrenError.message);
    }

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
