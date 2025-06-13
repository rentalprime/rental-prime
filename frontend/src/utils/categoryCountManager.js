/**
 * Category Count Manager
 * Manages category listing counts and provides refresh functionality
 */

import categoryService from '../services/categoryService';

class CategoryCountManager {
  constructor() {
    this.listeners = [];
    this.refreshCallbacks = new Set();
  }

  /**
   * Register a callback to be called when category counts need to be refreshed
   * @param {Function} callback - Function to call when refresh is needed
   */
  onRefreshNeeded(callback) {
    this.refreshCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.refreshCallbacks.delete(callback);
    };
  }

  /**
   * Notify that a listing has been created, updated, or deleted
   * This will trigger a refresh of affected category counts
   * @param {Object} options - Options object
   * @param {string} options.oldCategoryId - Previous category ID (for updates)
   * @param {string} options.newCategoryId - New category ID (for creates/updates)
   * @param {string} options.action - Action type: 'create', 'update', 'delete'
   */
  async notifyListingChange({ oldCategoryId, newCategoryId, action }) {
    try {
      console.log(`📢 Listing ${action} notification:`, { oldCategoryId, newCategoryId });
      
      // Determine which categories need to be refreshed
      const categoriesToRefresh = new Set();
      
      if (oldCategoryId) {
        categoriesToRefresh.add(oldCategoryId);
      }
      
      if (newCategoryId) {
        categoriesToRefresh.add(newCategoryId);
      }
      
      if (categoriesToRefresh.size === 0) {
        console.log('No categories to refresh');
        return;
      }
      
      const categoryIds = Array.from(categoriesToRefresh);
      console.log(`🔄 Refreshing counts for categories:`, categoryIds);
      
      // Refresh the category counts
      const updatedCounts = await categoryService.refreshCategoryListingCounts(categoryIds);
      
      // Notify all registered callbacks
      this.refreshCallbacks.forEach(callback => {
        try {
          callback(updatedCounts, categoryIds);
        } catch (error) {
          console.error('Error in category count refresh callback:', error);
        }
      });
      
      console.log(`✅ Category count refresh completed`);
      
    } catch (error) {
      console.error('Error in notifyListingChange:', error);
    }
  }

  /**
   * Manually trigger a refresh of all category counts
   * This can be used when you want to refresh all counts
   */
  async refreshAllCounts() {
    try {
      console.log('🔄 Manually refreshing all category counts');
      
      // Notify callbacks that a full refresh is needed
      this.refreshCallbacks.forEach(callback => {
        try {
          callback(null, null, true); // null values indicate full refresh
        } catch (error) {
          console.error('Error in category count refresh callback:', error);
        }
      });
      
    } catch (error) {
      console.error('Error in refreshAllCounts:', error);
    }
  }
}

// Create a singleton instance
const categoryCountManager = new CategoryCountManager();

export default categoryCountManager;
