import BaseService from "./baseService";
import apiClient from "../utils/apiClient";

class PlanService extends BaseService {
  constructor() {
    super("plans");
  }

  // Get plans with filters
  async getPlans(filters = {}) {
    try {
      const response = await apiClient.get(this.baseUrl, filters);

      // Handle error response
      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data || response;
    } catch (error) {
      console.error("Error fetching plans with filters:", error);
      throw error;
    }
  }

  // Get plan statistics
  async getPlanStats() {
    try {
      const response = await apiClient.get(`${this.baseUrl}/stats`);

      // Handle error response
      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data || response;
    } catch (error) {
      console.error("Error fetching plan statistics:", error);
      throw error;
    }
  }

  // Create a new plan
  async createPlan(planData) {
    try {
      const response = await apiClient.post(this.baseUrl, planData);

      // Handle error response
      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data || response;
    } catch (error) {
      console.error("Error creating plan:", error);
      throw error;
    }
  }

  // Update an existing plan
  async updatePlan(id, planData) {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}`, planData);

      // Handle error response
      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data || response;
    } catch (error) {
      console.error("Error updating plan:", error);
      throw error;
    }
  }

  // Delete a plan
  async deletePlan(id) {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/${id}`);

      // Handle error response
      if (response.error) {
        throw new Error(response.error.message);
      }

      return true;
    } catch (error) {
      console.error("Error deleting plan:", error);
      throw error;
    }
  }
}

export default new PlanService();
