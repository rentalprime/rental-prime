const supabase = require("../config/supabase");

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

    // Start building the query
    let query = supabase.from("plans").select("*");

    // Apply filters if provided
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    // Interval filter
    if (interval && interval !== "all") {
      query = query.eq("interval", interval);
    }

    // Search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Price range filters
    if (minPrice) {
      query = query.gte("price", parseFloat(minPrice));
    }
    if (maxPrice) {
      query = query.lte("price", parseFloat(maxPrice));
    }

    // Apply ordering
    const ascending = orderDirection === "asc";
    query = query.order(orderBy, { ascending });

    // Apply pagination
    if (limit && offset) {
      query = query.range(
        parseInt(offset),
        parseInt(offset) + parseInt(limit) - 1
      );
    }

    const { data: plans, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({
      success: true,
      count: plans.length,
      total: count,
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
    const { data: plan, error } = await supabase
      .from("plans")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: `Plan not found with id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: plan,
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

    // Prepare plan data
    const planData = {
      name: name.trim(),
      description: description ? description.trim() : null,
      price: parseFloat(price),
      interval,
      features: features || null,
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: plan, error } = await supabase
      .from("plans")
      .insert([planData])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    res.status(201).json({
      success: true,
      data: plan,
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
    const { data: existingPlan, error: fetchError } = await supabase
      .from("plans")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (fetchError) {
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
    if (price !== undefined) updateData.price = parseFloat(price);
    if (features !== undefined) updateData.features = features;
    if (status !== undefined) updateData.status = status;
    if (interval !== undefined) updateData.interval = interval;

    const { data: plan, error } = await supabase
      .from("plans")
      .update(updateData)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({
      success: true,
      data: plan,
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
    const { data: existingPlan, error: fetchError } = await supabase
      .from("plans")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (fetchError) {
      return res.status(404).json({
        success: false,
        message: `Plan not found with id of ${req.params.id}`,
      });
    }

    // Delete the plan
    const { error } = await supabase
      .from("plans")
      .delete()
      .eq("id", req.params.id);

    if (error) {
      throw new Error(error.message);
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

    // Delete the plans
    const { error } = await supabase.from("plans").delete().in("id", ids);

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({
      success: true,
      data: {},
      message: `${ids.length} plans deleted successfully`,
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
    const { data: existingPlan, error: fetchError } = await supabase
      .from("plans")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (fetchError) {
      return res.status(404).json({
        success: false,
        message: `Plan not found with id of ${req.params.id}`,
      });
    }

    // Update plan status
    const { data: plan, error } = await supabase
      .from("plans")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({
      success: true,
      data: plan,
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
    const { count: totalPlans, error: totalError } = await supabase
      .from("plans")
      .select("*", { count: "exact", head: true });

    if (totalError) {
      throw new Error(totalError.message);
    }

    // Get active plans count
    const { count: activePlans, error: activeError } = await supabase
      .from("plans")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    if (activeError) {
      throw new Error(activeError.message);
    }

    // Get inactive plans count
    const { count: inactivePlans, error: inactiveError } = await supabase
      .from("plans")
      .select("*", { count: "exact", head: true })
      .eq("status", "inactive");

    if (inactiveError) {
      throw new Error(inactiveError.message);
    }

    // Get draft plans count
    const { count: draftPlans, error: draftError } = await supabase
      .from("plans")
      .select("*", { count: "exact", head: true })
      .eq("status", "draft");

    if (draftError) {
      throw new Error(draftError.message);
    }

    // Get plans by interval
    const { data: intervalStats, error: intervalError } = await supabase
      .from("plans")
      .select("interval")
      .eq("status", "active");

    if (intervalError) {
      throw new Error(intervalError.message);
    }

    // Count plans by interval
    const intervalCounts = intervalStats.reduce((acc, plan) => {
      acc[plan.interval] = (acc[plan.interval] || 0) + 1;
      return acc;
    }, {});

    // Get average price
    const { data: priceData, error: priceError } = await supabase
      .from("plans")
      .select("price")
      .eq("status", "active");

    if (priceError) {
      throw new Error(priceError.message);
    }

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
    let query = supabase.from("plans").select("*").eq("status", "active");

    // Apply ordering
    const ascending = orderDirection === "asc";
    query = query.order(orderBy, { ascending });

    // Apply pagination
    if (limit && offset) {
      query = query.range(
        parseInt(offset),
        parseInt(offset) + parseInt(limit) - 1
      );
    }

    const { data: plans, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({
      success: true,
      count: plans.length,
      total: count,
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
