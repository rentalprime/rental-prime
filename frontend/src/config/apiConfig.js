/**
 * API Configuration for the Rental Prima Dashboard
 */

// Determine if we're in production or development
const isProduction = process.env.NODE_ENV === "production";

// Helper function to get environment variables with fallbacks
const getEnvVariable = (key, defaultValue) => {
  // Check for runtime environment variables (window._env_)
  if (window._env_ && window._env_[key]) {
    return window._env_[key];
  }
  // Fall back to process.env or default value
  return process.env[key] || defaultValue;
};

// Get the API URL from environment variables or use default values
const apiUrl = getEnvVariable(
  "REACT_APP_API_URL",
  "https://rental-prime-main-backend.onrender.com"
);

console.log("API URL:", apiUrl);
console.log("Environment:", isProduction ? "production" : "development");

const API_CONFIG = {
  // Base URL for the backend API
  baseUrl: apiUrl,

  // API endpoints
  endpoints: {
    auth: {
      login: "/api/auth/login",
      register: "/api/auth/register",
      logout: "/api/auth/logout",
      me: "/api/auth/me",
    },
    users: "/api/users",
    admins: "/api/admins",
    categories: "/api/categories",
    listings: "/api/admin/listings", // Admin dashboard uses admin listing routes
    publicListings: "/api/listings", // Public listing routes for reference
    payments: "/api/payments",
    plans: "/api/plans",
    settings: "/api/settings",
    notifications: "/api/notifications",
    support: "/api/support",
  },

  // Request timeout in milliseconds
  timeout: 30000,
};

export default API_CONFIG;
