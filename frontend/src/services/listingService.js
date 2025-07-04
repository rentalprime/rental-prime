import BaseService from "./baseService";

class ListingService extends BaseService {
  constructor() {
    super("admin/listings"); // Use admin listings endpoint for admin dashboard
  }

  /**
   * Get listings with advanced filters
   * @param {Object} filters - Filter options
   * @param {string} filters.status - Filter by status
   * @param {string} filters.category - Filter by category ID
   * @param {string} filters.subcategory - Filter by subcategory ID
   * @param {boolean} filters.featured - Filter by featured status
   * @param {string} filters.search - Search in title, description, or location
   * @param {string} filters.orderBy - Field to order by
   * @param {string} filters.orderDirection - Order direction (asc/desc)
   * @param {number} filters.limit - Limit number of results
   * @param {number} filters.offset - Offset for pagination
   * @returns {Promise<Array>} Array of listings
   */
  async getListings(filters = {}) {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      // Add all filters to query params
      if (filters.status && filters.status !== "all") {
        queryParams.append("status", filters.status);
      }

      if (filters.category && filters.category !== "all") {
        queryParams.append("category", filters.category);
      }

      if (filters.subcategory && filters.subcategory !== "all") {
        queryParams.append("subcategory", filters.subcategory);
      }

      if (filters.is_featured === true) {
        queryParams.append("featured", "true");
      }

      if (filters.search) {
        queryParams.append("search", filters.search);
      }

      if (filters.minPrice) {
        queryParams.append("minPrice", filters.minPrice);
      }

      if (filters.maxPrice) {
        queryParams.append("maxPrice", filters.maxPrice);
      }

      // Pagination
      if (filters.limit) {
        queryParams.append("limit", filters.limit);
      }

      if (filters.offset) {
        queryParams.append("offset", filters.offset);
      }

      // Ordering
      if (filters.orderBy) {
        queryParams.append("orderBy", filters.orderBy);
      }

      if (filters.orderDirection) {
        queryParams.append("orderDirection", filters.orderDirection);
      }

      // Use the admin API endpoint to get all listings (admin + vendor)
      const apiUrl =
        process.env.REACT_APP_API_URL ||
        "https://rental-prime-backend-8ilt.onrender.com";
      const fullUrl = `${apiUrl}/api/admin/listings?${queryParams.toString()}`;

      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          data: [],
          count: 0,
          success: false,
          error: errorData.message || "Failed to fetch admin listings",
        };
      }

      const data = await response.json();

      // Return the full response object to maintain count and data structure
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
        count: 0,
        success: false,
      };
    } catch (error) {
      // Return proper format instead of throwing to prevent UI errors
      return {
        data: [],
        count: 0,
        success: false,
        error: error.message || "Network error",
      };
    }
  }

  /**
   * Get a single listing by ID with full details
   * @param {string} id - Listing ID
   * @returns {Promise<Object>} Listing object with related data
   */
  async getListing(id) {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";
      const fullUrl = `${apiUrl}/api/admin/listings/${id}`;

      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch listing ${id}`);
      }

      const data = await response.json();

      // Return the data from the response
      if (data.success && data.data) {
        return data.data;
      }

      // Fallback for unexpected response format
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new listing
   * @param {Object} listing - Listing data
   * @returns {Promise<Object>} Created listing
   */
  async createListing(listing) {
    try {
      // Validate required fields
      if (!listing.title) throw new Error("Listing title is required");
      if (!listing.price) throw new Error("Listing price is required");
      if (!listing.category_id) throw new Error("Category is required");
      // Note: user_id is not required here as it's handled by backend authentication

      // Ensure price is a number
      const price = parseFloat(listing.price);
      if (isNaN(price)) throw new Error("Price must be a valid number");

      // Prepare the listing data
      const listingData = {
        ...listing,
        price,
        status: listing.status || "active",
        is_featured: listing.is_featured || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Use the admin API endpoint for admin dashboard
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";
      const fullUrl = `${apiUrl}/api/admin/listings`;

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(listingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create listing");
      }

      const data = await response.json();

      // Return the data from the response
      if (data.success && data.data) {
        return data.data;
      }

      // Fallback for unexpected response format
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an existing listing
   * @param {string} id - Listing ID
   * @param {Object} updates - Updated listing data
   * @returns {Promise<Object>} Updated listing
   */
  async updateListing(id, updates) {
    try {
      if (!id) throw new Error("Listing ID is required");

      // Ensure price is a number if provided
      let updatedData = { ...updates };
      if (updates.price !== undefined) {
        const price = parseFloat(updates.price);
        if (isNaN(price)) throw new Error("Price must be a valid number");
        updatedData.price = price;
      }

      // Add updated_at timestamp
      updatedData.updated_at = new Date().toISOString();

      // Use the admin API endpoint for admin dashboard
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";
      const fullUrl = `${apiUrl}/api/admin/listings/${id}`;

      const response = await fetch(fullUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update listing ${id}`);
      }

      const data = await response.json();

      // Return the data from the response
      if (data.success && data.data) {
        return data.data;
      }

      // Fallback for unexpected response format
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a listing by ID
   * @param {string} id - Listing ID
   * @returns {Promise<void>}
   */
  async deleteListing(id) {
    try {
      if (!id) {
        throw new Error("Listing ID is required");
      }

      // Use the admin API endpoint for admin dashboard
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";
      const fullUrl = `${apiUrl}/api/admin/listings/${id}`;

      const response = await fetch(fullUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete listing ${id}`);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get listings by category (including all subcategories)
   * Note: This method uses the public API since admin routes don't have category-specific endpoints
   * @param {string} categoryId - Parent category ID
   * @param {Object} options - Additional options like limit, status
   * @returns {Promise<Array>} Array of listings
   */
  async getListingsByCategory(categoryId, options = {}) {
    try {
      // For category-specific listings, we'll use the main getListings method with category filter
      const filters = {
        category: categoryId,
        ...options,
      };

      return await this.getListings(filters);
    } catch (error) {
      return [];
    }
  }

  /**
   * Get featured listings
   * @param {number} limit - Maximum number of listings to return
   * @returns {Promise<Array>} Array of featured listings
   */
  async getFeaturedListings(limit = 8) {
    try {
      // Use the main getListings method with featured filter
      const filters = {
        is_featured: true,
        limit: limit,
        orderBy: "created_at",
        orderDirection: "desc",
      };

      return await this.getListings(filters);
    } catch (error) {
      return [];
    }
  }

  /**
   * Count listings by category ID
   * @param {string} categoryId - Category ID
   * @returns {Promise<number>} Number of listings
   */
  async countListingsByCategory(categoryId) {
    try {
      // This method would need to be implemented via API
      // For now, return 0 as a placeholder
      return 0;
    } catch (error) {
      return 0;
    }
  }
}

export default new ListingService();
