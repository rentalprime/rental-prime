import BaseService from "./baseService";
import apiClient from "../utils/apiClient";

// Table name for categories
const CATEGORY_TABLE = "categories";

class CategoryService extends BaseService {
  constructor() {
    super(CATEGORY_TABLE);
  }

  /**
   * Get all categories with optional filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Array of categories
   */
  async getCategories(filters = {}) {
    try {
      console.log("Fetching categories with filters:", filters);

      // Build query parameters
      const params = {};
      if (filters.status && filters.status !== "all") {
        params.status = filters.status;
      }
      if (filters.parent_id) {
        params.parent_id = filters.parent_id;
      }
      if (filters.search) {
        params.search = filters.search;
      }
      if (filters.orderBy) {
        params.orderBy = filters.orderBy;
      }
      if (filters.orderDirection) {
        params.orderDirection = filters.orderDirection;
      }
      if (filters.limit) {
        params.limit = filters.limit;
      }
      if (filters.offset) {
        params.offset = filters.offset;
      }

      const response = await apiClient.get("/api/categories", params);

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data || [];
      console.log(`Successfully fetched ${data.length} categories`);
      return data;
    } catch (error) {
      console.error("Error fetching categories with filters:", error);
      throw error;
    }
  }

  /**
   * Get a category by ID
   * @param {string} id - Category ID
   * @returns {Promise<Object>} Category object
   */
  async getCategoryById(id) {
    try {
      console.log("Fetching category by ID:", id);
      const response = await apiClient.get(`/api/categories/${id}`);

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data;
      if (!data) {
        throw new Error(`Category with ID ${id} not found`);
      }

      console.log("Successfully fetched category:", data);
      return data;
    } catch (error) {
      console.error("Error fetching category by ID:", error);
      throw error;
    }
  }

  /**
   * Create a new category
   * @param {Object} category - Category data
   * @returns {Promise<Object>} Created category
   */
  async createCategory(category) {
    try {
      console.log("Creating new category:", category);

      // Validate required fields
      if (!category.name || !category.name.trim()) {
        throw new Error("Category name is required");
      }

      const categoryData = {
        name: category.name.trim(),
        description: category.description || "",
        status: category.status || "active",
        parent_id: category.parent_id || null,
        image_url: category.image_url || null,
      };

      console.log("Creating category with data:", categoryData);

      const response = await apiClient.post("/api/categories", categoryData);

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data;
      if (!data) {
        throw new Error("Category created but no data returned");
      }

      console.log("Category created successfully:", data);
      return data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  /**
   * Update an existing category
   * @param {string} id - Category ID
   * @param {Object} category - Updated category data
   * @returns {Promise<Object>} Updated category
   */
  async updateCategory(id, category) {
    try {
      console.log("Updating category ID:", id, "with data:", category);

      const updateData = {
        name: category.name?.trim(),
        description: category.description || "",
        status: category.status || "active",
        parent_id: category.parent_id || null,
        image_url: category.image_url || null,
      };

      console.log("Updating category with data:", updateData);

      const response = await apiClient.put(`/api/categories/${id}`, updateData);

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data;
      if (!data) {
        throw new Error("No data returned after update");
      }

      console.log("Category updated successfully:", data);
      return data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  }

  /**
   * Delete a category
   * @param {string} id - Category ID
   * @returns {Promise<void>}
   */
  async deleteCategory(id) {
    try {
      console.log("Deleting category ID:", id);

      const response = await apiClient.delete(`/api/categories/${id}`);

      if (response.error) {
        throw new Error(response.error.message);
      }

      console.log("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }

  /**
   * Get active categories for dropdown lists
   * @returns {Promise<Array>} Array of active categories
   */
  async getActiveCategories() {
    try {
      console.log("Fetching active categories");
      const response = await apiClient.get("/api/categories", {
        status: "active",
        orderBy: "name",
        orderDirection: "asc",
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data || [];
      console.log(`Successfully fetched ${data.length} active categories`);
      return data;
    } catch (error) {
      console.error("Error fetching active categories:", error);
      throw error;
    }
  }

  /**
   * Get parent categories for dropdown lists
   * @returns {Promise<Array>} Array of parent categories
   */
  async getParentCategories() {
    try {
      console.log("Fetching parent categories");
      const response = await apiClient.get("/api/categories", {
        status: "active",
        parent_id: "null",
        orderBy: "name",
        orderDirection: "asc",
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data || [];
      console.log(`Successfully fetched ${data.length} parent categories`);
      return data;
    } catch (error) {
      console.error("Error fetching parent categories:", error);
      throw error;
    }
  }

  /**
   * Get subcategories for a specific parent
   * @param {string} parentId - Parent category ID
   * @returns {Promise<Array>} Array of subcategories
   */
  async getSubcategories(parentId) {
    try {
      console.log(`Fetching subcategories for parent ID: ${parentId}`);
      const response = await apiClient.get("/api/categories", {
        status: "active",
        parent_id: parentId,
        orderBy: "name",
        orderDirection: "asc",
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data || [];
      console.log(`Successfully fetched ${data.length} subcategories`);
      return data;
    } catch (error) {
      console.error(
        `Error fetching subcategories for parent ID: ${parentId}`,
        error
      );
      throw error;
    }
  }

  /**
   * Get hierarchical category tree
   * @returns {Promise<Array>} Array of categories with their children
   */
  async getCategoryTree() {
    try {
      console.log("Fetching category tree");
      const response = await apiClient.get("/api/categories/hierarchy", {
        status: "active",
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data || [];
      console.log(
        `Successfully fetched category tree with ${data.length} root categories`
      );
      return data;
    } catch (error) {
      console.error("Error fetching category tree:", error);
      throw error;
    }
  }

  /**
   * Get categories formatted for dropdown/select components
   * @returns {Promise<Array>} Array of categories with label/value format
   */
  async getCategoriesForDropdown() {
    try {
      console.log("Fetching categories for dropdown");
      const categories = await this.getActiveCategories();

      // Format categories for dropdown use
      const formattedCategories = categories.map((category) => ({
        label: category.name,
        value: category.id,
        slug: category.slug,
        description: category.description,
        parent_id: category.parent_id,
        // Keep original category data for reference
        originalData: category,
      }));

      console.log(
        `Successfully formatted ${formattedCategories.length} categories for dropdown`
      );
      return formattedCategories;
    } catch (error) {
      console.error("Error fetching categories for dropdown:", error);
      throw error;
    }
  }

  /**
   * Get category hierarchy formatted for dropdown with parent-child structure
   * @returns {Promise<Array>} Array of categories with subcategories
   */
  async getCategoryHierarchyForDropdown() {
    try {
      console.log("Fetching category hierarchy for dropdown");
      const tree = await this.getCategoryTree();

      // Format tree structure for dropdown use
      const formattedHierarchy = tree.map((category) => ({
        label: category.name,
        value: category.id,
        slug: category.slug,
        description: category.description,
        subcategories: category.children.map((child) => ({
          label: child.name,
          value: child.id,
          slug: child.slug,
          description: child.description,
          parent_id: child.parent_id,
        })),
      }));

      console.log(
        `Successfully formatted category hierarchy with ${formattedHierarchy.length} main categories`
      );
      return formattedHierarchy;
    } catch (error) {
      console.error("Error fetching category hierarchy for dropdown:", error);
      throw error;
    }
  }
}

export default new CategoryService();
