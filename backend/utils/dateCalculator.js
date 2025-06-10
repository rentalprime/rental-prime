/**
 * Date Calculator Utility
 * Handles subscription end date calculations based on plan intervals
 */

/**
 * Calculate end date based on plan interval
 * @param {string|Date} startDate - The start date of the subscription
 * @param {string} interval - The plan interval (monthly, quarterly, half-yearly, yearly)
 * @returns {Date} - The calculated end date
 */
function calculateEndDate(startDate, interval) {
  const startDateObj = new Date(startDate);
  let calculatedEndDate = null;

  // Validate start date
  if (isNaN(startDateObj.getTime())) {
    throw new Error("Invalid start date provided");
  }

  switch (interval) {
    case "monthly":
      calculatedEndDate = new Date(startDateObj);
      calculatedEndDate.setMonth(calculatedEndDate.getMonth() + 1);
      break;
    case "quarterly":
      calculatedEndDate = new Date(startDateObj);
      calculatedEndDate.setMonth(calculatedEndDate.getMonth() + 3);
      break;
    case "half-yearly":
      calculatedEndDate = new Date(startDateObj);
      calculatedEndDate.setMonth(calculatedEndDate.getMonth() + 6);
      break;
    case "yearly":
      calculatedEndDate = new Date(startDateObj);
      calculatedEndDate.setFullYear(calculatedEndDate.getFullYear() + 1);
      break;
    default:
      // If interval is not recognized, use monthly as default
      console.warn(`Unknown interval '${interval}', defaulting to monthly`);
      calculatedEndDate = new Date(startDateObj);
      calculatedEndDate.setMonth(calculatedEndDate.getMonth() + 1);
      break;
  }

  return calculatedEndDate;
}

/**
 * Calculate subscription duration in days
 * @param {string|Date} startDate - The start date of the subscription
 * @param {string|Date} endDate - The end date of the subscription
 * @returns {number} - Duration in days
 */
function calculateDurationInDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid date(s) provided");
  }

  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Get interval duration mapping
 * @returns {Object} - Mapping of intervals to their duration descriptions
 */
function getIntervalDurations() {
  return {
    monthly: "1 month",
    quarterly: "3 months",
    "half-yearly": "6 months",
    yearly: "1 year",
  };
}

/**
 * Validate if end date is after start date
 * @param {string|Date} startDate - The start date
 * @param {string|Date} endDate - The end date
 * @returns {boolean} - True if end date is after start date
 */
function isValidDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }

  return end > start;
}

/**
 * Get next billing date based on interval
 * @param {string|Date} currentDate - Current billing date
 * @param {string} interval - The plan interval
 * @returns {Date} - Next billing date
 */
function getNextBillingDate(currentDate, interval) {
  return calculateEndDate(currentDate, interval);
}

/**
 * Check if a subscription is expired
 * @param {string|Date} endDate - The subscription end date
 * @param {string|Date} currentDate - Current date (optional, defaults to now)
 * @returns {boolean} - True if subscription is expired
 */
function isSubscriptionExpired(endDate, currentDate = new Date()) {
  const end = new Date(endDate);
  const current = new Date(currentDate);

  if (isNaN(end.getTime()) || isNaN(current.getTime())) {
    throw new Error("Invalid date(s) provided");
  }

  return current > end;
}

/**
 * Get days remaining in subscription
 * @param {string|Date} endDate - The subscription end date
 * @param {string|Date} currentDate - Current date (optional, defaults to now)
 * @returns {number} - Days remaining (negative if expired)
 */
function getDaysRemaining(endDate, currentDate = new Date()) {
  const end = new Date(endDate);
  const current = new Date(currentDate);

  if (isNaN(end.getTime()) || isNaN(current.getTime())) {
    throw new Error("Invalid date(s) provided");
  }

  const diffTime = end - current;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

module.exports = {
  calculateEndDate,
  calculateDurationInDays,
  getIntervalDurations,
  isValidDateRange,
  getNextBillingDate,
  isSubscriptionExpired,
  getDaysRemaining,
};
