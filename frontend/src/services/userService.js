import BaseService from "./baseService";
import apiClient from "../utils/apiClient";

class UserService extends BaseService {
  constructor() {
    super("users");
  }

  // Get users with filters
  async getUsers(filters = {}) {
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
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get active roles
  async getActiveRoles() {
    try {
      const response = await apiClient.get("/api/roles");
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  }

  // Create a new user
  async create(userData) {
    try {
      const response = await apiClient.post(this.baseUrl, userData);

      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update a user
  async update(id, updates) {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}`, updates);

      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new UserService();
