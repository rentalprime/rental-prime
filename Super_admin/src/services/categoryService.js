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
      const response = await apiClient.get(`/api/categories/${id}`);

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data;
      if (!data) {
        throw new Error(`Category with ID ${id} not found`);
      }

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

      const response = await apiClient.post("/api/categories", categoryData);

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data;
      if (!data) {
        throw new Error("Category created but no data returned");
      }

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
      const updateData = {
        name: category.name?.trim(),
        description: category.description || "",
        status: category.status || "active",
        parent_id: category.parent_id || null,
        image_url: category.image_url || null,
      };

      const response = await apiClient.put(`/api/categories/${id}`, updateData);

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data;
      if (!data) {
        throw new Error("No data returned after update");
      }

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
      const response = await apiClient.delete(`/api/categories/${id}`);

      if (response.error) {
        throw new Error(response.error.message);
      }
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
      const response = await apiClient.get("/api/categories", {
        status: "active",
        orderBy: "name",
        orderDirection: "asc",
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data || [];
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
      const response = await apiClient.get("/api/categories/hierarchy", {
        status: "active",
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data || [];
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

      return formattedHierarchy;
    } catch (error) {
      console.error("Error fetching category hierarchy for dropdown:", error);
      throw error;
    }
  }

  /**
   * Get listing count for a specific category
   * @param {string} categoryId - Category ID
   * @returns {Promise<number>} Number of listings in the category
   */
  async getCategoryListingCount(categoryId) {
    try {
      const response = await apiClient.get(
        `/api/listings/category/${categoryId}`
      );

      if (response.error) {
        throw new Error(response.error.message);
      }

      const count = response.count || 0;
      return count;
    } catch (error) {
      console.error(
        `Error fetching listing count for category ${categoryId}:`,
        error
      );
      // Return 0 instead of throwing to prevent UI breaks
      return 0;
    }
  }

  /**
   * Get listing counts for multiple categories
   * @param {Array<string>} categoryIds - Array of category IDs
   * @returns {Promise<Object>} Object with categoryId as key and count as value
   */
  async getCategoryListingCounts(categoryIds) {
    try {
      // Limit the number of categories to prevent excessive API calls
      const maxCategories = 50;
      const limitedIds = categoryIds.slice(0, maxCategories);

      if (limitedIds.length < categoryIds.length) {
        console.warn(
          `Limited category count requests to ${maxCategories} out of ${categoryIds.length} categories`
        );
      }

      // Make a single batch request for all category counts
      const response = await apiClient.post("/api/listings/category-counts", {
        categoryIds: limitedIds,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const countsMap = response.data || {};
      return countsMap;
    } catch (error) {
      console.error("Error fetching category listing counts:", error);
      // Return empty object instead of throwing to prevent UI breaks
      return {};
    }
  }
}

export default new CategoryService();
