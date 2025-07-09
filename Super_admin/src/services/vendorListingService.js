/**
 * Vendor Listing Service - Handles vendor-only listings for dashboard statistics
 * Uses /api/listings endpoint which returns only vendor listings (owner_type = 'user')
 */

class VendorListingService {
  constructor() {
    this.baseUrl =
      "https://rental-prime-backend-8ilt.onrender.com/api/listings";
  }

  /**
   * Get vendor listings count for dashboard statistics
   * @param {Object} filters - Filter options (optional)
   * @returns {Promise<Object>} Response with count and data
   */
  async getVendorListings(filters = {}) {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      // Add filters if provided
      if (filters.status && filters.status !== "all") {
        queryParams.append("status", filters.status);
      }

      if (filters.limit) {
        queryParams.append("limit", filters.limit);
      }

      if (filters.offset) {
        queryParams.append("offset", filters.offset);
      }

      // Build the full URL
      const fullUrl = queryParams.toString()
        ? `${this.baseUrl}?${queryParams.toString()}`
        : this.baseUrl;

      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error fetching vendor listings:", errorData);
        return {
          data: [],
          count: 0,
          success: false,
          error: errorData.message || "Failed to fetch vendor listings",
        };
      }

      const data = await response.json();

      // Return the response in expected format
      if (data.success && data.data) {
        return {
          data: data.data,
          count: data.count || 0,
          success: data.success,
        };
      }

      // Fallback for unexpected response format
      return {
        data: Array.isArray(data) ? data : [],
        count: data.count || 0,
        success: false,
      };
    } catch (error) {
      return {
        data: [],
        count: 0,
        success: false,
        error: error.message || "Network error",
      };
    }
  }

  /**
   * Get vendor listings count only (optimized for dashboard)
   * @returns {Promise<number>} Count of vendor listings
   */
  async getVendorListingsCount() {
    try {
      // Use the optimized count endpoint
      const countUrl = `${this.baseUrl}/count`;

      const response = await fetch(countUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error fetching vendor listings count:", errorData);
        return 0;
      }

      const data = await response.json();

      return data.count || 0;
    } catch (error) {
      console.error("Error fetching vendor listings count:", error);
      return 0;
    }
  }
}

// Export a singleton instance
const vendorListingService = new VendorListingService();
export default vendorListingService;
