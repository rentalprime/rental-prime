const db = require("../config/database");
const { v4: uuidv4 } = require("uuid");
const { calculateEndDate } = require("../utils/dateCalculator");

/**
 * Subscription Controller
 * Handles all subscription-related operations
 */

// @desc    Assign plan to vendor (self-assignment)
// @route   POST /api/subscriptions/assign
// @access  Private/Vendor
exports.assignPlan = async (req, res) => {
  try {
    const { plan_id } = req.body;

    // Vendors can only assign plans to themselves
    const user_id = req.user.id;

    // Validation
    if (!plan_id) {
      return res.status(400).json({
        success: false,
        message: "Please provide plan_id",
      });
    }

    // Validate UUID format for plan_id
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(plan_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid UUID format for plan_id",
      });
    }

    // Check if plan exists and is active
    const planResult = await db.query(
      "SELECT id, name, price, interval, status FROM plans WHERE id = $1",
      [plan_id]
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    const plan = planResult.rows[0];

    if (plan.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Cannot assign inactive plan",
      });
    }

    // Check if vendor already has an active subscription to this plan
    const existingResult = await db.query(
      "SELECT id, is_active FROM user_subscriptions WHERE user_id = $1 AND plan_id = $2 AND is_active = true",
      [user_id, plan_id]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You already have an active subscription to this plan",
      });
    }

    // Set start_date to current timestamp (always automatic)
    const startDateObj = new Date();
    let finalEndDate;

    try {
      // Always calculate end_date based on plan interval - no manual override
      finalEndDate = calculateEndDate(startDateObj, plan.interval);
    } catch (dateError) {
      return res.status(400).json({
        success: false,
        message: "Error calculating end date: " + dateError.message,
      });
    }

    // Generate UUID for the subscription
    const subscriptionId = uuidv4();

    // Prepare subscription data
    const subscriptionData = {
      id: subscriptionId,
      user_id,
      plan_id,
      start_date: startDateObj.toISOString(),
      end_date: finalEndDate.toISOString(),
      is_active: true,
    };
    console.log("Subscription data:", subscriptionData);

    // Create subscription
    const insertedSubscription = await db.insert(
      "user_subscriptions",
      subscriptionData
    );

    if (!insertedSubscription) {
      throw new Error("Failed to create subscription");
    }

    // Get the created subscription with user and plan details
    const query = `
      SELECT
        us.*,
        u.id as user_id_info, u.name as user_name, u.email as user_email,
        p.id as plan_id_info, p.name as plan_name, p.price as plan_price, p.interval as plan_interval
      FROM user_subscriptions us
      LEFT JOIN users u ON us.user_id = u.id
      LEFT JOIN plans p ON us.plan_id = p.id
      WHERE us.id = $1
    `;

    const result = await db.query(query, [subscriptionId]);
    const subscriptionRow = result.rows[0];

    // Format the response to match the original structure
    const subscription = {
      ...subscriptionRow,
      users: subscriptionRow.user_id_info
        ? {
            id: subscriptionRow.user_id_info,
            name: subscriptionRow.user_name,
            email: subscriptionRow.user_email,
          }
        : null,
      plans: subscriptionRow.plan_id_info
        ? {
            id: subscriptionRow.plan_id_info,
            name: subscriptionRow.plan_name,
            price: subscriptionRow.plan_price,
            interval: subscriptionRow.plan_interval,
          }
        : null,
      // Remove the separate fields
      user_id_info: undefined,
      user_name: undefined,
      user_email: undefined,
      plan_id_info: undefined,
      plan_name: undefined,
      plan_price: undefined,
      plan_interval: undefined,
    };

    res.status(201).json({
      success: true,
      message: "Plan assigned successfully",
      data: subscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get vendor's subscriptions
// @route   GET /api/subscriptions
// @access  Private/Vendor
exports.getVendorSubscriptions = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { status, limit = 50, offset = 0 } = req.query;

    // Build the PostgreSQL query with plan details
    let queryText = `
      SELECT
        us.*,
        p.id as plan_id_info, p.name as plan_name, p.price as plan_price,
        p.interval as plan_interval, p.status as plan_status
      FROM user_subscriptions us
      LEFT JOIN plans p ON us.plan_id = p.id
      WHERE us.user_id = $1
    `;

    const conditions = [];
    const values = [user_id];
    let paramCount = 1;

    // Filter by status if provided
    if (status && status !== "all") {
      if (status === "active") {
        paramCount++;
        conditions.push(`us.is_active = $${paramCount}`);
        values.push(true);
      } else if (status === "inactive") {
        paramCount++;
        conditions.push(`us.is_active = $${paramCount}`);
        values.push(false);
      }
    }

    // Add additional conditions
    if (conditions.length > 0) {
      queryText += ` AND ${conditions.join(" AND ")}`;
    }

    // Apply ordering and pagination
    queryText += ` ORDER BY us.created_at DESC`;

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

    const result = await db.query(queryText, values);

    // Format the subscriptions to match the original structure
    const subscriptions = result.rows.map((row) => ({
      ...row,
      plans: row.plan_id_info
        ? {
            id: row.plan_id_info,
            name: row.plan_name,
            price: row.plan_price,
            interval: row.plan_interval,
            status: row.plan_status,
          }
        : null,
      // Remove the separate plan fields
      plan_id_info: undefined,
      plan_name: undefined,
      plan_price: undefined,
      plan_interval: undefined,
      plan_status: undefined,
    }));

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Cancel vendor's subscription
// @route   PUT /api/subscriptions/:id/cancel
// @access  Private/Vendor
exports.cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Check if subscription exists and belongs to the vendor
    const subscriptionResult = await db.query(
      "SELECT * FROM user_subscriptions WHERE id = $1 AND user_id = $2",
      [id, user_id]
    );

    if (subscriptionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    const subscription = subscriptionResult.rows[0];

    if (!subscription.is_active) {
      return res.status(400).json({
        success: false,
        message: "Subscription is already inactive",
      });
    }

    // Update subscription to inactive
    const updatedSubscription = await db.update("user_subscriptions", id, {
      is_active: false,
    });

    if (!updatedSubscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
      data: updatedSubscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
