import apiClient from "../utils/apiClient";

class BaseService {
  constructor(tableName) {
    this.tableName = tableName;
    this.baseUrl = `/api/${tableName}`;
  }

  // Get all records
  async getAll() {
    try {
      const response = await apiClient.get(this.baseUrl);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error fetching ${this.tableName}:`, error);
      throw error;
    }
  }

  // Get a single record by ID
  async getById(id) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error fetching ${this.tableName} by ID:`, error);
      throw error;
    }
  }

  // Create a new record
  async create(record) {
    try {
      const response = await apiClient.post(this.baseUrl, record);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      throw error;
    }
  }

  // Update an existing record
  async update(id, updates) {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}`, updates);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      throw error;
    }
  }

  // Delete a record
  async delete(id) {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      throw error;
    }
  }
}

export default BaseService;
