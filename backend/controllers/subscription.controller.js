const supabase = require("../config/supabase");
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
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("id, name, price, interval, status")
      .eq("id", plan_id)
      .single();

    if (planError || !plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    if (plan.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Cannot assign inactive plan",
      });
    }

    // Check if vendor already has an active subscription to this plan
    const { data: existingSubscription, error: existingError } = await supabase
      .from("user_subscriptions")
      .select("id, is_active")
      .eq("user_id", user_id)
      .eq("plan_id", plan_id)
      .eq("is_active", true)
      .single();

    if (!existingError && existingSubscription) {
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

    // Prepare subscription data
    const subscriptionData = {
      user_id,
      plan_id,
      start_date: startDateObj.toISOString(),
      end_date: finalEndDate.toISOString(),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    console.log("Subscription data:", subscriptionData);

    // Create subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .insert([subscriptionData])
      .select(
        `
        *,
        users (
          id,
          name,
          email
        ),
        plans (
          id,
          name,
          price,
          interval
        )
      `
      )
      .single();

    if (subscriptionError) {
      console.log("Error creating subscription:", subscriptionError);

      throw new Error(subscriptionError.message);
    }

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

    let query = supabase
      .from("user_subscriptions")
      .select(
        `
        *,
        plans (
          id,
          name,
          price,
          interval,
          status
        )
      `
      )
      .eq("user_id", user_id);

    // Filter by status if provided
    if (status && status !== "all") {
      if (status === "active") {
        query = query.eq("is_active", true);
      } else if (status === "inactive") {
        query = query.eq("is_active", false);
      }
    }

    // Apply pagination
    query = query
      .order("created_at", { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data: subscriptions, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

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
    const { data: subscription, error: fetchError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("id", id)
      .eq("user_id", user_id)
      .single();

    if (fetchError || !subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    if (!subscription.is_active) {
      return res.status(400).json({
        success: false,
        message: "Subscription is already inactive",
      });
    }

    // Update subscription to inactive
    const { data: updatedSubscription, error: updateError } = await supabase
      .from("user_subscriptions")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      throw new Error(updateError.message);
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
