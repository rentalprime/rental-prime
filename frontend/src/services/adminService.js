import BaseService from "./baseService";
import apiClient from "../utils/apiClient";

class AdminService extends BaseService {
  constructor() {
    super("admins");
  }

  /**
   * Get all admin users
   * @returns {Promise<Array>} Array of admin users
   */
  async getAllAdmins() {
    try {
      console.log("Fetching all admin users from API");
      const response = await apiClient.get(this.baseUrl);
      const data = response.data || response;

      console.log("Successfully fetched admin users:", data);
      return data || [];
    } catch (error) {
      console.error("Error fetching admin users:", error);
      throw error;
    }
  }

  /**
   * Get admin users with filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Array of filtered admin users
   */
  async getAdmins(filters = {}) {
    try {
      const params = new URLSearchParams();

      // Apply filters if provided
      if (filters.status && filters.status !== "all") {
        params.append("status", filters.status);
      }

      if (filters.search) {
        params.append("search", filters.search);
      }

      const response = await apiClient.get(
        `${this.baseUrl}?${params.toString()}`
      );

      // Handle the response format from backend
      if (response.success && response.data) {
        return response.data;
      }

      return response.data || response;
    } catch (error) {
      console.error("Error fetching admin users with filters:", error);
      throw error;
    }
  }

  /**
   * Create a new admin user
   * @param {Object} adminData - Admin user data
   * @returns {Promise<Object>} Created admin user
   */
  async createAdmin(adminData) {
    try {
      console.log("Creating admin user with data:", adminData);

      const response = await apiClient.post(this.baseUrl, adminData);

      console.log("Create admin result:", response.data);

      // Handle the response format from backend
      if (response.success && response.data) {
        return response.data;
      }

      return response.data || response;
    } catch (error) {
      console.error("Error creating admin user:", error);
      throw error;
    }
  }

  /**
   * Update an existing admin user
   * @param {string} id - Admin user ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated admin user
   */
  async updateAdmin(id, updates) {
    try {
      console.log("Updating admin user:", id, "with data:", updates);

      const response = await apiClient.put(`${this.baseUrl}/${id}`, updates);

      console.log("Update admin result:", response.data);

      // Handle the response format from backend
      if (response.success && response.data) {
        return response.data;
      }

      return response.data || response;
    } catch (error) {
      console.error("Error updating admin user:", error);
      throw error;
    }
  }

  /**
   * Delete an admin user
   * @param {string} id - Admin user ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteAdmin(id) {
    try {
      console.log("Deleting admin user:", id);

      await apiClient.delete(`${this.baseUrl}/${id}`);

      console.log("Admin user deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting admin user:", error);
      throw error;
    }
  }

  /**
   * Get a single admin user by ID
   * @param {string} id - Admin user ID
   * @returns {Promise<Object>} Admin user data
   */
  async getAdminById(id) {
    try {
      console.log("Fetching admin user by ID:", id);

      const response = await apiClient.get(`${this.baseUrl}/${id}`);

      console.log("Fetched admin user:", response.data);
      return response.data || response;
    } catch (error) {
      console.error("Error fetching admin user by ID:", error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const adminService = new AdminService();
export default adminService;
