import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "react-hot-toast";
import authService from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Helper function to check if user is allowed to access admin dashboard
const isUserAllowedForAdmin = (user, userTable) => {
  // Allow users from admin_users table (these are admin users)
  if (userTable === "admin_users") {
    return true;
  }

  // For users from the regular users table, check user_type
  if (userTable === "users") {
    // Only allow super_admin user_type from users table
    // Block customer and vendor/owner user types
    return user.user_type === "super_admin";
  }

  // Default to false for unknown table types
  return false;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // Check if user is logged in on page load
  useEffect(() => {
    // Add a safety timeout to ensure loading state is cleared even if everything fails
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 5000); // 5 seconds max for initial auth check

    // Initial check for user session
    const checkCurrentSession = async () => {
      try {
        // Check for stored token and user data
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
          try {
            const userData = JSON.parse(storedUser);

            // Try to get current user from API to verify token is still valid
            const currentUser = await authService.getCurrentUser();

            if (currentUser) {
              // Check if the current user is allowed to access admin dashboard
              // Note: We need to determine userTable from the stored data or API response
              const storedUserTable =
                localStorage.getItem("userTable") || "users"; // Default to users if not stored
              const isAdminUser = isUserAllowedForAdmin(
                currentUser,
                storedUserTable
              );

              if (isAdminUser) {
                setUser(currentUser);
                setIsAuthenticated(true);
              } else {
                // Clear unauthorized user data
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                localStorage.removeItem("userTable");
                setUser(null);
                setIsAuthenticated(false);
              }
            } else {
              // Token might be invalid, use stored data as fallback but check authorization
              const storedUserTable =
                localStorage.getItem("userTable") || "users";
              const isAdminUser = isUserAllowedForAdmin(
                userData,
                storedUserTable
              );

              if (isAdminUser) {
                setUser(userData);
                setIsAuthenticated(true);
              } else {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                localStorage.removeItem("userTable");
                setUser(null);
                setIsAuthenticated(false);
              }
            }
          } catch (error) {
            // Clear invalid data
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          // No stored session found, ensure user is logged out
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        // On error, ensure user is logged out to prevent infinite loading
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        // Always set loading to false to ensure UI is not stuck
        setLoading(false);
        clearTimeout(safetyTimeout);
      }
    };

    // Call the check immediately
    checkCurrentSession();
  }, []);

  // Login user with backend API
  const login = async (email, password) => {
    setLoading(true);

    try {
      // Authenticate with backend API
      const result = await authService.signIn(email, password);

      // If we have a valid result with user data
      if (result && result.user) {
        // Check if user is allowed to access admin dashboard
        const isAdminUser = isUserAllowedForAdmin(
          result.user,
          result.userTable
        );

        if (!isAdminUser) {
          setLoading(false);
          throw new Error("UNAUTHORIZED_USER_TYPE");
        }

        setUser(result.user);
        setIsAuthenticated(true);

        // Set session if available
        if (result.session) {
          setSession(result.session);
        }

        // Store user data
        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.setItem("userTable", result.userTable); // Store userTable for future authorization checks
        if (result.session) {
          localStorage.setItem("session", JSON.stringify(result.session));
        }

        toast.success("Login successful");
        setLoading(false);
        return true;
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      // Don't show generic error message for unauthorized user types
      // The Login component will handle this specific error
      if (error.message !== "UNAUTHORIZED_USER_TYPE") {
        toast.error("Login failed. Please check your credentials.");
      }

      setLoading(false);
      return false;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      const result = await authService.signOut();

      // Always clear local state regardless of API result
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);

      // Clear userTable from localStorage
      localStorage.removeItem("userTable");

      if (result.warning) {
        toast.success("Logged out locally. Server connection unavailable.");
      } else {
        toast.success("Logged out successfully");
      }
    } catch (error) {
      // Still clear user data even if logout API fails
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("userTable");
      toast.success("Logged out locally");
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      if (!user || !user.id) {
        throw new Error("User not authenticated");
      }

      const updatedUser = await authService.updateProfile(user.id, userData);
      setUser({ ...user, ...updatedUser });

      // Update stored user data
      localStorage.setItem("user", JSON.stringify({ ...user, ...updatedUser }));

      toast.success("Profile updated successfully");
      return true;
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
      return false;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      await authService.resetPassword(email);
      toast.success("Password reset instructions sent to your email");
      return true;
    } catch (error) {
      toast.error(error.message || "Failed to send password reset");
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        session,
        login,
        logout,
        updateProfile,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
