import API_CONFIG from '../config/apiConfig';

/**
 * API Client for making HTTP requests to the backend
 */
class ApiClient {
  /**
   * Make a GET request to the API
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with response data
   */
  static async get(endpoint, params = {}) {
    try {
      const url = new URL(`${API_CONFIG.baseUrl}${endpoint}`);
      
      // Add query parameters
      Object.keys(params).forEach(key => 
        url.searchParams.append(key, params[key])
      );
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this._getHeaders(),
        credentials: 'include'
      });
      
      return this._handleResponse(response);
    } catch (error) {
      console.error('API GET Error:', error);
      // Return a standardized error object instead of throwing
      return { error: { message: 'Network error. Please check your connection or server status.' } };
    }
  }
  
  /**
   * Make a POST request to the API
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @returns {Promise} - Promise with response data
   */
  static async post(endpoint, data = {}) {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this._getHeaders(),
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      return this._handleResponse(response);
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  }
  
  /**
   * Make a PUT request to the API
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @returns {Promise} - Promise with response data
   */
  static async put(endpoint, data = {}) {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this._getHeaders(),
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      return this._handleResponse(response);
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  }
  
  /**
   * Make a DELETE request to the API
   * @param {string} endpoint - API endpoint
   * @returns {Promise} - Promise with response data
   */
  static async delete(endpoint) {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this._getHeaders(),
        credentials: 'include'
      });
      
      return this._handleResponse(response);
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  }
  
  /**
   * Get request headers including auth token if available
   * @returns {Object} - Headers object
   * @private
   */
  static _getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }
  
  /**
   * Handle API response
   * @param {Response} response - Fetch API response
   * @returns {Promise} - Promise with response data
   * @private
   */
  static async _handleResponse(response) {
    try {
      const data = await response.json();
      console.log('API response:', response.status, data);
      
      if (!response.ok) {
        const error = data.message || response.statusText;
        throw new Error(error);
      }
      
      return data;
    } catch (error) {
      console.error('Error handling API response:', error);
      throw error;
    }
  }
}

export default ApiClient;
