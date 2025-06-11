const supabase = require("../config/supabase");

/**
 * Check if vendor has an active plan
 * @param {string} userId - The vendor's user ID
 * @returns {Object} - { hasActivePlan: boolean, plan: object|null, subscription: object|null, error: string|null }
 */
async function checkVendorActivePlan(userId) {
  try {
    // Get vendor's active subscription with plan details
    const { data: subscription, error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .select(
        `
        *,
        plans (
          id,
          name,
          price,
          interval,
          features,
          status
        )
      `
      )
      .eq("user_id", userId)
      .eq("is_active", true)
      .gte("end_date", new Date().toISOString()) // Check if subscription hasn't expired
      .single();

    if (subscriptionError) {
      // If no subscription found, return false
      if (subscriptionError.code === "PGRST116") {
        return {
          hasActivePlan: false,
          plan: null,
          subscription: null,
          error: null,
        };
      }

      return {
        hasActivePlan: false,
        plan: null,
        subscription: null,
        error: subscriptionError.message,
      };
    }

    // Check if plan is active
    if (!subscription.plans || subscription.plans.status !== "active") {
      return {
        hasActivePlan: false,
        plan: subscription.plans,
        subscription: subscription,
        error: "Plan is not active",
      };
    }

    return {
      hasActivePlan: true,
      plan: subscription.plans,
      subscription: subscription,
      error: null,
    };
  } catch (error) {
    return {
      hasActivePlan: false,
      plan: null,
      subscription: null,
      error: error.message,
    };
  }
}

/**
 * Get listing limits from plan features
 * @param {Object} plan - The plan object
 * @returns {number|null} - Available listings count (null means unlimited)
 */
function getPlanListingLimits(plan) {
  if (!plan || !plan.features) {
    return 0;
  }

  try {
    // If features is a string, parse it as JSON
    let features = plan.features;
    if (typeof features === "string") {
      features = JSON.parse(features);
    }

    // Extract listing limits directly from features.listings
    return features.listings === "unlimited"
      ? null
      : parseInt(features.listings) || 0;
  } catch (error) {
    console.error("Error parsing plan features:", error);
    return 0;
  }
}

/**
 * Get featured listing limits from plan features
 * @param {Object} plan - The plan object
 * @returns {number|null} - Available featured listings count (null means unlimited)
 */
function getPlanFeaturedLimits(plan) {
  if (!plan || !plan.features) {
    return 0;
  }

  try {
    // If features is a string, parse it as JSON
    let features = plan.features;
    if (typeof features === "string") {
      features = JSON.parse(features);
    }

    // Extract featured limits directly from features.featured
    return features.featured === "unlimited"
      ? null
      : parseInt(features.featured) || 0;
  } catch (error) {
    console.error("Error parsing plan features:", error);
    return 0;
  }
}

/**
 * Count vendor's current listings
 * @param {string} userId - The vendor's user ID
 * @returns {Object} - { totalListings: number, featuredListings: number, error: string|null }
 */
async function countVendorListings(userId) {
  try {
    // Count total active listings
    const { count: totalListings, error: totalError } = await supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", userId)
      .eq("owner_type", "user")
      .in("status", ["active", "pending"]); // Count both active and pending listings

    if (totalError) {
      return {
        totalListings: 0,
        featuredListings: 0,
        error: totalError.message,
      };
    }

    // Count featured listings
    const { count: featuredListings, error: featuredError } = await supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", userId)
      .eq("owner_type", "user")
      .eq("is_featured", true)
      .in("status", ["active", "pending"]);

    if (featuredError) {
      return {
        totalListings: totalListings || 0,
        featuredListings: 0,
        error: featuredError.message,
      };
    }

    return {
      totalListings: totalListings || 0,
      featuredListings: featuredListings || 0,
      error: null,
    };
  } catch (error) {
    return {
      totalListings: 0,
      featuredListings: 0,
      error: error.message,
    };
  }
}

/**
 * Validate if vendor can create a new listing
 * @param {string} userId - The vendor's user ID
 * @param {boolean} isFeatured - Whether the listing will be featured
 * @returns {Object} - { canCreate: boolean, reason: string|null, planInfo: object|null }
 */
async function validateListingCreation(userId, isFeatured = false) {
  try {
    // Check if vendor has an active plan
    const planCheck = await checkVendorActivePlan(userId);

    if (!planCheck.hasActivePlan) {
      return {
        canCreate: false,
        reason:
          planCheck.error ||
          "You need an active plan to create listings. Please purchase a plan first.",
        planInfo: null,
      };
    }

    // Get plan listing limits
    const maxListings = getPlanListingLimits(planCheck.plan);
    const maxFeaturedListings = getPlanFeaturedLimits(planCheck.plan);

    // Count current listings
    const currentListings = await countVendorListings(userId);

    if (currentListings.error) {
      return {
        canCreate: false,
        reason: "Error checking current listings: " + currentListings.error,
        planInfo: planCheck,
      };
    }

    // Check total listing limit
    if (maxListings !== null && currentListings.totalListings >= maxListings) {
      return {
        canCreate: false,
        reason: `You have reached your plan's listing limit of ${maxListings}. Please upgrade your plan to create more listings.`,
        planInfo: planCheck,
      };
    }

    // Check featured listing limit if this is a featured listing
    if (isFeatured) {
      if (
        maxFeaturedListings !== null &&
        currentListings.featuredListings >= maxFeaturedListings
      ) {
        return {
          canCreate: false,
          reason: `You have reached your plan's featured listing limit of ${maxFeaturedListings}. Please upgrade your plan to create more featured listings.`,
          planInfo: planCheck,
        };
      }
    }

    return {
      canCreate: true,
      reason: null,
      planInfo: planCheck,
    };
  } catch (error) {
    return {
      canCreate: false,
      reason: "Error validating listing creation: " + error.message,
      planInfo: null,
    };
  }
}

/**
 * Validate if vendor can update a listing (specifically for featured status changes)
 * @param {string} userId - The vendor's user ID
 * @param {boolean} currentIsFeatured - Current featured status of the listing
 * @param {boolean} newIsFeatured - New featured status being set
 * @returns {Object} - { canUpdate: boolean, reason: string|null, planInfo: object|null }
 */
async function validateListingUpdate(
  userId,
  currentIsFeatured = false,
  newIsFeatured = false
) {
  try {
    // If not changing featured status, no validation needed
    if (currentIsFeatured === newIsFeatured) {
      return {
        canUpdate: true,
        reason: null,
        planInfo: null,
      };
    }

    // If changing from featured to non-featured, always allow
    if (currentIsFeatured && !newIsFeatured) {
      return {
        canUpdate: true,
        reason: null,
        planInfo: null,
      };
    }

    // If changing from non-featured to featured, validate featured limits
    if (!currentIsFeatured && newIsFeatured) {
      // Check if vendor has an active plan
      const planCheck = await checkVendorActivePlan(userId);

      if (!planCheck.hasActivePlan) {
        return {
          canUpdate: false,
          reason:
            planCheck.error ||
            "You need an active plan to make listings featured. Please purchase a plan first.",
          planInfo: null,
        };
      }

      // Get plan featured limits
      const maxFeaturedListings = getPlanFeaturedLimits(planCheck.plan);

      // Count current listings
      const currentListings = await countVendorListings(userId);

      if (currentListings.error) {
        return {
          canUpdate: false,
          reason: "Error checking current listings: " + currentListings.error,
          planInfo: planCheck,
        };
      }

      // Check featured listing limit
      if (
        maxFeaturedListings !== null &&
        currentListings.featuredListings >= maxFeaturedListings
      ) {
        return {
          canUpdate: false,
          reason: `You have reached your plan's featured listing limit of ${maxFeaturedListings}. Please upgrade your plan to make more listings featured.`,
          planInfo: planCheck,
        };
      }
    }

    return {
      canUpdate: true,
      reason: null,
      planInfo: null,
    };
  } catch (error) {
    return {
      canUpdate: false,
      reason: "Error validating listing update: " + error.message,
      planInfo: null,
    };
  }
}

module.exports = {
  checkVendorActivePlan,
  getPlanListingLimits,
  getPlanFeaturedLimits,
  countVendorListings,
  validateListingCreation,
  validateListingUpdate,
};
