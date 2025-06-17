import BaseService from "./baseService";
import apiClient from "../utils/apiClient";

class RoleService extends BaseService {
  constructor() {
    super("roles");
  }

  /**
   * Get all roles
   * @returns {Promise<Array>} Array of roles
   */
  async getAllRoles() {
    try {
      const response = await apiClient.get(this.baseUrl);
      const data = response.data.data || response.data;

      return data || [];
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  }

  /**
   * Get active roles (for dropdowns)
   * @returns {Promise<Array>} Array of active roles
   */
  async getActiveRoles() {
    try {
      const response = await apiClient.get(`${this.baseUrl}?status=active`);
      const data = response.data.data || response.data;

      return data || [];
    } catch (error) {
      console.error("Error fetching active roles:", error);
      throw error;
    }
  }

  /**
   * Create a new role
   * @param {Object} role - Role data
   * @returns {Promise<Object>} Created role
   */
  async createRole(role) {
    try {
      const response = await apiClient.post(this.baseUrl, role);
      const data = response.data.data || response.data;

      return data;
    } catch (error) {
      console.error("Error creating role:", error);
      throw error;
    }
  }

  /**
   * Update an existing role
   * @param {string} id - Role ID
   * @param {Object} role - Updated role data
   * @returns {Promise<Object>} Updated role
   */
  async updateRole(id, role) {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}`, role);
      const data = response.data.data || response.data;

      return data;
    } catch (error) {
      console.error("Error updating role:", error);
      throw error;
    }
  }

  /**
   * Delete a role
   * @param {string} id - Role ID
   * @returns {Promise<void>}
   */
  async deleteRole(id) {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error("Error deleting role:", error);
      throw error;
    }
  }

  /**
   * Get role by ID
   * @param {string} id - Role ID
   * @returns {Promise<Object>} Role object
   */
  async getRoleById(id) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      const data = response.data.data || response.data;

      return data;
    } catch (error) {
      console.error("Error fetching role by ID:", error);
      throw error;
    }
  }
}

export default new RoleService();
