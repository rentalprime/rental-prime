const db = require("../config/database");

/**
 * Check if vendor has an active plan
 * @param {string} userId - The vendor's user ID
 * @returns {Object} - { hasActivePlan: boolean, plan: object|null, subscription: object|null, error: string|null }
 */
async function checkVendorActivePlan(userId) {
  try {
    // Get vendor's active subscription with plan details
    const query = `
      SELECT
        us.*,
        p.id as plan_id, p.name as plan_name, p.price as plan_price,
        p.interval as plan_interval, p.features as plan_features, p.status as plan_status
      FROM user_subscriptions us
      LEFT JOIN plans p ON us.plan_id = p.id
      WHERE us.user_id = $1
        AND us.is_active = true
        AND us.end_date >= $2
      LIMIT 1
    `;

    const result = await db.query(query, [userId, new Date().toISOString()]);

    if (result.rows.length === 0) {
      return {
        hasActivePlan: false,
        plan: null,
        subscription: null,
        error: null,
      };
    }

    const row = result.rows[0];

    // Reconstruct the subscription and plan objects
    const subscription = {
      id: row.id,
      user_id: row.user_id,
      plan_id: row.plan_id,
      is_active: row.is_active,
      start_date: row.start_date,
      end_date: row.end_date,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };

    const plan = row.plan_id
      ? {
          id: row.plan_id,
          name: row.plan_name,
          price: row.plan_price,
          interval: row.plan_interval,
          features: row.plan_features,
          status: row.plan_status,
        }
      : null;

    // Check if plan is active
    if (!plan || plan.status !== "active") {
      return {
        hasActivePlan: false,
        plan: plan,
        subscription: subscription,
        error: "Plan is not active",
      };
    }

    return {
      hasActivePlan: true,
      plan: plan,
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
    const totalResult = await db.query(
      "SELECT COUNT(*) FROM listings WHERE owner_id = $1 AND owner_type = 'user' AND status IN ('active', 'pending')",
      [userId]
    );
    const totalListings = parseInt(totalResult.rows[0].count);

    // Count featured listings
    const featuredResult = await db.query(
      "SELECT COUNT(*) FROM listings WHERE owner_id = $1 AND owner_type = 'user' AND is_featured = true AND status IN ('active', 'pending')",
      [userId]
    );
    const featuredListings = parseInt(featuredResult.rows[0].count);

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
