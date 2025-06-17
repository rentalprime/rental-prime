const db = require("../config/database");
const { v4: uuidv4 } = require("uuid");

// @desc    Get all plans with filters
// @route   GET /api/plans
// @access  Public
exports.getPlans = async (req, res) => {
  try {
    const {
      search,
      status,
      interval,
      minPrice,
      maxPrice,
      limit = 50,
      offset = 0,
      orderBy = "created_at",
      orderDirection = "desc",
    } = req.query;

    // Build the PostgreSQL query
    let queryText = "SELECT * FROM plans WHERE 1=1";
    const conditions = [];
    const values = [];
    let paramCount = 0;

    // Apply filters if provided
    if (status && status !== "all") {
      paramCount++;
      conditions.push(`status = $${paramCount}`);
      values.push(status);
    }

    // Interval filter
    if (interval && interval !== "all") {
      paramCount++;
      conditions.push(`interval = $${paramCount}`);
      values.push(interval);
    }

    // Search filter
    if (search) {
      paramCount++;
      conditions.push(
        `(name ILIKE $${paramCount} OR description ILIKE $${paramCount})`
      );
      values.push(`%${search}%`);
    }

    // Price range filters
    if (minPrice) {
      paramCount++;
      conditions.push(`price >= $${paramCount}`);
      values.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      paramCount++;
      conditions.push(`price <= $${paramCount}`);
      values.push(parseFloat(maxPrice));
    }

    // Add conditions to query
    if (conditions.length > 0) {
      queryText += ` AND ${conditions.join(" AND ")}`;
    }

    // Apply ordering
    const validOrderFields = ["created_at", "updated_at", "name", "price"];
    const orderField = validOrderFields.includes(orderBy)
      ? orderBy
      : "created_at";
    const direction = orderDirection === "asc" ? "ASC" : "DESC";
    queryText += ` ORDER BY ${orderField} ${direction}`;

    // Apply pagination
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

    // Execute main query
    const result = await db.query(queryText, values);
    const plans = result.rows;

    // Get total count for pagination
    let countQuery = "SELECT COUNT(*) FROM plans WHERE 1=1";
    const countConditions = [];
    const countValues = [];
    let countParamCount = 0;

    // Apply same filters for count
    if (status && status !== "all") {
      countParamCount++;
      countConditions.push(`status = $${countParamCount}`);
      countValues.push(status);
    }

    if (interval && interval !== "all") {
      countParamCount++;
      countConditions.push(`interval = $${countParamCount}`);
      countValues.push(interval);
    }

    if (search) {
      countParamCount++;
      countConditions.push(
        `(name ILIKE $${countParamCount} OR description ILIKE $${countParamCount})`
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
      count: plans.length,
      total: totalCount,
      data: plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get single plan
// @route   GET /api/plans/:id
// @access  Public
exports.getPlan = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM plans WHERE id = $1", [
      req.params.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Plan not found with id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create new plan
// @route   POST /api/plans
// @access  Private/Super Admin
exports.createPlan = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      features,
      status = "active",
      interval = "monthly",
    } = req.body;

    // Validation
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: "Please provide name and price",
      });
    }

    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    // Validate interval
    const validIntervals = ["monthly", "quarterly", "half-yearly", "yearly"];
    if (!validIntervals.includes(interval)) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid interval (monthly, quarterly, half-yearly, yearly)",
      });
    }

    // Generate UUID for the plan
    const planId = uuidv4();

    // Prepare plan data
    const planData = {
      id: planId,
      name: name.trim(),
      description: description ? description.trim() : null,
      price: parseFloat(price).toFixed(2),
      interval,
      features: features || null,
      status,
    };

    // Insert the plan
    const insertedPlan = await db.insert("plans", planData);

    if (!insertedPlan) {
      throw new Error("Failed to create plan");
    }

    res.status(201).json({
      success: true,
      data: insertedPlan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update plan
// @route   PUT /api/plans/:id
// @access  Private/Super Admin
exports.updatePlan = async (req, res) => {
  try {
    const { name, description, price, features, status, interval } = req.body;

    // Check if plan exists
    const existingPlanQuery = await db.query(
      "SELECT * FROM plans WHERE id = $1",
      [req.params.id]
    );

    if (existingPlanQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Plan not found with id of ${req.params.id}`,
      });
    }

    // Validation
    if (price !== undefined && price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    // Validate interval if provided
    if (interval !== undefined) {
      const validIntervals = ["monthly", "quarterly", "half-yearly", "yearly"];
      if (!validIntervals.includes(interval)) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide a valid interval (monthly, quarterly, half-yearly, yearly)",
        });
      }
    }

    // Prepare update data
    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined)
      updateData.description = description ? description.trim() : null;
    if (price !== undefined) updateData.price = parseFloat(price).toFixed(2);
    if (features !== undefined) updateData.features = features;
    if (status !== undefined) updateData.status = status;
    if (interval !== undefined) updateData.interval = interval;

    // Remove undefined values and prepare update data
    const cleanUpdateData = {};
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        cleanUpdateData[key] = updateData[key];
      }
    });

    // Update the plan
    const updatedPlan = await db.update(
      "plans",
      req.params.id,
      cleanUpdateData
    );

    if (!updatedPlan) {
      return res.status(404).json({
        success: false,
        message: `Plan not found with id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: updatedPlan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Delete plan
// @route   DELETE /api/plans/:id
// @access  Private/Super Admin
exports.deletePlan = async (req, res) => {
  try {
    // Check if plan exists
    const existingPlanQuery = await db.query(
      "SELECT * FROM plans WHERE id = $1",
      [req.params.id]
    );

    if (existingPlanQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Plan not found with id of ${req.params.id}`,
      });
    }

    // Delete the plan
    const deletedPlan = await db.delete("plans", req.params.id);

    if (!deletedPlan) {
      throw new Error("Failed to delete plan");
    }

    res.status(200).json({
      success: true,
      data: {},
      message: "Plan deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Bulk delete plans
// @route   DELETE /api/plans/bulk
// @access  Private/Super Admin
exports.bulkDeletePlans = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of plan IDs",
      });
    }

    // Delete the plans using PostgreSQL IN clause
    const placeholders = ids.map((_, index) => `$${index + 1}`).join(", ");
    const deleteQuery = `DELETE FROM plans WHERE id IN (${placeholders}) RETURNING *`;

    const result = await db.query(deleteQuery, ids);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No plans found with the provided IDs",
      });
    }

    res.status(200).json({
      success: true,
      data: {},
      message: `${result.rows.length} plans deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update plan status
// @route   PATCH /api/plans/:id/status
// @access  Private/Super Admin
exports.updatePlanStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !["active", "inactive", "draft"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid status (active, inactive, draft)",
      });
    }

    // Check if plan exists
    const existingPlanQuery = await db.query(
      "SELECT * FROM plans WHERE id = $1",
      [req.params.id]
    );

    if (existingPlanQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Plan not found with id of ${req.params.id}`,
      });
    }

    // Update plan status
    const updatedPlan = await db.update("plans", req.params.id, {
      status,
    });

    if (!updatedPlan) {
      return res.status(404).json({
        success: false,
        message: `Plan not found with id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: updatedPlan,
      message: "Plan status updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get plan statistics
// @route   GET /api/plans/stats
// @access  Private/Super Admin
exports.getPlanStats = async (req, res) => {
  try {
    // Get total plans count
    const totalResult = await db.query("SELECT COUNT(*) FROM plans");
    const totalPlans = parseInt(totalResult.rows[0].count);

    // Get active plans count
    const activeResult = await db.query(
      "SELECT COUNT(*) FROM plans WHERE status = 'active'"
    );
    const activePlans = parseInt(activeResult.rows[0].count);

    // Get inactive plans count
    const inactiveResult = await db.query(
      "SELECT COUNT(*) FROM plans WHERE status = 'inactive'"
    );
    const inactivePlans = parseInt(inactiveResult.rows[0].count);

    // Get draft plans count
    const draftResult = await db.query(
      "SELECT COUNT(*) FROM plans WHERE status = 'draft'"
    );
    const draftPlans = parseInt(draftResult.rows[0].count);

    // Get plans by interval
    const intervalResult = await db.query(
      "SELECT interval FROM plans WHERE status = 'active'"
    );
    const intervalStats = intervalResult.rows;

    // Count plans by interval
    const intervalCounts = intervalStats.reduce((acc, plan) => {
      acc[plan.interval] = (acc[plan.interval] || 0) + 1;
      return acc;
    }, {});

    // Get average price
    const priceResult = await db.query(
      "SELECT price FROM plans WHERE status = 'active'"
    );
    const priceData = priceResult.rows;

    const averagePrice =
      priceData.length > 0
        ? priceData.reduce((sum, plan) => sum + parseFloat(plan.price), 0) /
          priceData.length
        : 0;

    const stats = {
      totalPlans: totalPlans || 0,
      activePlans: activePlans || 0,
      inactivePlans: inactivePlans || 0,
      draftPlans: draftPlans || 0,
      intervalBreakdown: intervalCounts,
      averagePrice: parseFloat(averagePrice.toFixed(2)),
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get active plans
// @route   GET /api/plans/active
// @access  Public
exports.getActivePlans = async (req, res) => {
  try {
    const {
      limit = 50,
      offset = 0,
      orderBy = "created_at",
      orderDirection = "desc",
    } = req.query;

    // Build query for active plans only
    let queryText = "SELECT * FROM plans WHERE status = 'active'";

    // Apply ordering
    const validOrderFields = ["created_at", "updated_at", "name", "price"];
    const orderField = validOrderFields.includes(orderBy)
      ? orderBy
      : "created_at";
    const direction = orderDirection === "asc" ? "ASC" : "DESC";
    queryText += ` ORDER BY ${orderField} ${direction}`;

    // Apply pagination
    const values = [];
    let paramCount = 0;

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

    // Execute main query
    const result = await db.query(queryText, values);
    const plans = result.rows;

    // Get total count
    const countResult = await db.query(
      "SELECT COUNT(*) FROM plans WHERE status = 'active'"
    );
    const totalCount = parseInt(countResult.rows[0].count);

    res.status(200).json({
      success: true,
      count: plans.length,
      total: totalCount,
      data: plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get plans with subscriber counts
// @route   GET /api/plans/subscribers
// @access  Private/Super Admin
exports.getSubscribers = async (req, res) => {
  try {
    const {
      status,
      orderBy = "subscriber_count",
      orderDirection = "desc",
      limit = 50,
      offset = 0,
    } = req.query;

    // Get all plans first with optional status filter
    let planQuery = "SELECT * FROM plans";
    const planValues = [];
    let planParamCount = 0;

    if (status && status !== "all") {
      planParamCount++;
      planQuery += ` WHERE status = $${planParamCount}`;
      planValues.push(status);
    }

    const planResult = await db.query(planQuery, planValues);
    const allPlans = planResult.rows;

    // Get subscriber counts for each plan using a more efficient approach
    const plansWithSubscribers = await Promise.all(
      allPlans.map(async (plan) => {
        try {
          // Count active subscriptions
          const activeResult = await db.query(
            "SELECT COUNT(*) FROM user_subscriptions WHERE plan_id = $1 AND is_active = true",
            [plan.id]
          );
          const activeCount = parseInt(activeResult.rows[0].count);

          // Count total subscriptions
          const totalResult = await db.query(
            "SELECT COUNT(*) FROM user_subscriptions WHERE plan_id = $1",
            [plan.id]
          );
          const totalCount = parseInt(totalResult.rows[0].count);

          return {
            ...plan,
            subscriber_count: activeCount || 0,
            total_subscriptions: totalCount || 0,
          };
        } catch (error) {
          console.log(
            "Error counting subscriptions for plan:",
            plan.id,
            error.message
          );
          return {
            ...plan,
            subscriber_count: 0,
            total_subscriptions: 0,
          };
        }
      })
    );

    // Sort the results
    const validOrderFields = [
      "subscriber_count",
      "total_subscriptions",
      "name",
      "price",
      "created_at",
    ];
    const sortField = validOrderFields.includes(orderBy)
      ? orderBy
      : "subscriber_count";

    plansWithSubscribers.sort((a, b) => {
      let aValue, bValue;

      if (sortField === "name") {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        if (orderDirection === "asc") {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      } else {
        aValue = a[sortField] || 0;
        bValue = b[sortField] || 0;

        if (orderDirection === "asc") {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      }
    });

    // Apply pagination
    const startIndex = parseInt(offset) || 0;
    const endIndex = startIndex + (parseInt(limit) || 50);
    const paginatedPlans = plansWithSubscribers.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      count: paginatedPlans.length,
      total: plansWithSubscribers.length,
      data: paginatedPlans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
