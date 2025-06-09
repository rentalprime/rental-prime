import apiClient from "../utils/apiClient";
import API_CONFIG from "../config/apiConfig";

class AuthService {
  // Sign up a new user
  async signUp(email, password, userData) {
    try {
      const response = await apiClient.post(
        API_CONFIG.endpoints.auth.register,
        {
          email,
          password,
          ...userData,
        }
      );

      if (response.success) {
        return response.data;
      }

      throw new Error("Signup failed");
    } catch (error) {
      console.error("Error during sign up:", error);
      throw error;
    }
  }

  // Sign in a user
  async signIn(email, password) {
    try {
      const response = await apiClient.post(API_CONFIG.endpoints.auth.login, {
        email,
        password,
      });

      console.log("Backend API response:", response);

      // Handle the response format from our backend
      if (response.success && response.data) {
        // Store the token in localStorage if available
        if (response.data.session?.access_token) {
          localStorage.setItem("token", response.data.session.access_token);
        }

        // Return a compatible data structure
        return {
          session: response.data.session,
          user: response.data.user,
          userTable: response.data.userTable, // Include userTable for admin access control
        };
      }

      throw new Error("Login failed");
    } catch (error) {
      console.error("Error during sign in:", error);
      throw error;
    }
  }

  // Sign out a user
  async signOut() {
    try {
      // Try to call our backend API to logout
      try {
        await apiClient.get("/auth/logout");
      } catch (backendError) {
        console.warn(
          "Backend logout attempt failed (non-critical):",
          backendError
        );
      }

      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userTable");

      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local storage even if API call fails
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userTable");

      return {
        success: true,
        warning: "Logged out locally, but server logout failed",
      };
    }
  }

  // Get the current user
  async getCurrentUser() {
    try {
      // First try to get the token from localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No token found in localStorage");
        return null;
      }

      // Try the backend API to get current user
      try {
        const response = await apiClient.get(API_CONFIG.endpoints.auth.me);

        if (response.success && response.data) {
          return response.data;
        }
      } catch (apiError) {
        console.error("Backend API getCurrentUser failed:", apiError);
      }

      // If API call fails, return null
      return null;
    } catch (error) {
      console.error("Error getting current user:", error);
      // Instead of throwing, return null to prevent app from crashing
      return null;
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      const response = await apiClient.post("/api/auth/reset-password", {
        email,
      });

      if (response.success) {
        return true;
      }

      throw new Error("Password reset failed");
    } catch (error) {
      console.error("Error during password reset:", error);
      throw error;
    }
  }

  // Update user password
  async updatePassword(newPassword) {
    try {
      const response = await apiClient.put("/api/auth/update-password", {
        password: newPassword,
      });

      if (response.success) {
        return true;
      }

      throw new Error("Password update failed");
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(userId, userData) {
    try {
      const response = await apiClient.put(`/api/users/${userId}`, userData);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error("Profile update failed");
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }
}

export default new AuthService();
