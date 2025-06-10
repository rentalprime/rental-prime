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
 * @returns {Object} - { maxListings: number|null, maxFeaturedListings: number|null }
 */
function getPlanListingLimits(plan) {
  const defaultLimits = {
    maxListings: null, // null means unlimited
    maxFeaturedListings: 0,
  };

  if (!plan || !plan.features) {
    return defaultLimits;
  }

  try {
    // If features is a string, parse it as JSON
    let features = plan.features;
    if (typeof features === "string") {
      features = JSON.parse(features);
    }

    // If features is an array of strings, look for listing limits
    if (Array.isArray(features)) {
      const limits = { ...defaultLimits };

      features.forEach((feature) => {
        if (typeof feature === "string") {
          // Look for patterns like "10 listings", "unlimited listings", "5 featured listings"
          const listingMatch = feature
            .toLowerCase()
            .match(/(\d+|unlimited)\s+listings?/);
          const featuredMatch = feature
            .toLowerCase()
            .match(/(\d+)\s+featured\s+listings?/);

          if (listingMatch) {
            limits.maxListings =
              listingMatch[1] === "unlimited"
                ? null
                : parseInt(listingMatch[1]);
          }

          if (featuredMatch) {
            limits.maxFeaturedListings = parseInt(featuredMatch[1]);
          }
        }
      });

      return limits;
    }

    // If features is an object, look for specific properties
    if (typeof features === "object") {
      return {
        maxListings:
          features.maxListings !== undefined
            ? features.maxListings
            : features.listings !== undefined
            ? features.listings === "unlimited"
              ? null
              : parseInt(features.listings)
            : defaultLimits.maxListings,
        maxFeaturedListings:
          features.maxFeaturedListings !== undefined
            ? features.maxFeaturedListings
            : features.featured !== undefined
            ? features.featured === "unlimited"
              ? null
              : parseInt(features.featured)
            : defaultLimits.maxFeaturedListings,
      };
    }

    return defaultLimits;
  } catch (error) {
    console.error("Error parsing plan features:", error);
    return defaultLimits;
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
    const limits = getPlanListingLimits(planCheck.plan);

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
    if (
      limits.maxListings !== null &&
      currentListings.totalListings >= limits.maxListings
    ) {
      return {
        canCreate: false,
        reason: `You have reached your plan's listing limit of ${limits.maxListings}. Please upgrade your plan to create more listings.`,
        planInfo: planCheck,
      };
    }

    // Check featured listing limit if this is a featured listing
    if (
      isFeatured &&
      currentListings.featuredListings >= limits.maxFeaturedListings
    ) {
      return {
        canCreate: false,
        reason: `You have reached your plan's featured listing limit of ${limits.maxFeaturedListings}. Please upgrade your plan to create more featured listings.`,
        planInfo: planCheck,
      };
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

module.exports = {
  checkVendorActivePlan,
  getPlanListingLimits,
  countVendorListings,
  validateListingCreation,
};
