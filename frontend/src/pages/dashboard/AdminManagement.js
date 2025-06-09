import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  RiUserAddLine,
  RiEdit2Line,
  RiDeleteBinLine,
  RiSearchLine,
  RiFilterLine,
  RiCloseLine,
  RiShieldUserLine,
} from "react-icons/ri";
import { useAuth } from "../../context/AuthContext";
import adminService from "../../services/adminService";

const AdminManagement = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    user_type: "admin",
    status: "active",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Check if current user is super_admin
  const isSuperAdmin = user?.user_type === "super_admin";

  // Define allowed admin user types
  const allowedAdminUserTypes = [
    { value: "super_admin", label: "Super Admin" },
    { value: "admin", label: "Admin" },
    { value: "manager", label: "Manager" },
    { value: "accountant", label: "Accountant" },
    { value: "support", label: "Support" },
  ];

  // Define fetchAdmins and fetchRoles functions outside useEffect
  const fetchAdmins = useCallback(async () => {
    try {
      // Check if user is super_admin before fetching
      if (!isSuperAdmin) {
        toast.error("Access denied. Only super_admin can view admin users.");
        setLoading(false);
        return;
      }

      // Use the adminService to fetch admin users
      const filters = {};
      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }

      const adminData = await adminService.getAdmins(filters);
      console.log("Fetched admin users:", adminData);

      setAdmins(adminData);
    } catch (error) {
      console.error("Error fetching admin users:", error);

      // Handle authorization errors specifically
      if (error.response?.status === 403) {
        toast.error("Access denied. Only super_admin can view admin users.");
      } else {
        toast.error("Failed to fetch admin users");
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm, isSuperAdmin]);

  // Fetch admins on component mount
  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Open modal for adding a new admin
  const openAddModal = () => {
    // Check if user is super_admin before allowing add
    if (!isSuperAdmin) {
      toast.error("Access denied. Only super_admin can create admin users.");
      return;
    }

    setModalMode("add");

    // Initialize form with default values immediately
    const initializeForm = () => {
      const formDataToSet = {
        name: "",
        email: "",
        password: "",
        user_type: "admin", // Default user type for admin users
        status: "active",
      };

      setFormData(formDataToSet);

      console.log("Initialized form data:", formDataToSet);
    };

    // Initialize form immediately
    initializeForm();
    setShowModal(true);
  };

  // Open modal for editing an admin
  const openEditModal = (admin) => {
    // Check if user is super_admin before allowing edit
    if (!isSuperAdmin) {
      toast.error("Access denied. Only super_admin can edit admin users.");
      return;
    }

    console.log("Opening edit modal for admin:", admin);
    setModalMode("edit");
    setCurrentAdmin(admin);

    // Set form data from admin object immediately
    const formDataToSet = {
      name: admin.name,
      email: admin.email,
      password: "", // Don't populate password for security
      status: admin.status || "active",
      user_type: admin.user_type || "admin",
    };

    setFormData(formDataToSet);

    console.log("Set form data for editing:", formDataToSet);

    // Show modal immediately
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalMode === "add") {
        // Create a new admin using adminService
        const adminData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          user_type: formData.user_type,
          status: formData.status,
        };

        console.log("Creating new admin with data:", adminData);
        const newAdmin = await adminService.createAdmin(adminData);

        setAdmins([newAdmin, ...admins]);
        toast.success("Admin added successfully");
      } else if (modalMode === "edit" && currentAdmin) {
        // Update admin using adminService
        const adminData = {
          name: formData.name,
          email: formData.email,
          user_type: formData.user_type,
          status: formData.status,
        };

        // Only include password if it's provided
        if (formData.password) {
          adminData.password = formData.password;
        }

        console.log(
          "Updating admin:",
          currentAdmin.id,
          "with data:",
          adminData
        );
        const updatedAdmin = await adminService.updateAdmin(
          currentAdmin.id,
          adminData
        );

        const updatedAdmins = admins.map((admin) =>
          admin.id === currentAdmin.id ? updatedAdmin : admin
        );

        setAdmins(updatedAdmins);
        toast.success("Admin updated successfully");
      }

      setShowModal(false);
    } catch (error) {
      console.error("Error submitting admin form:", error);

      // Handle authorization errors specifically
      if (error.response?.status === 403) {
        toast.error("Access denied. Only super_admin can manage admin users.");
      } else {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            `Failed to ${modalMode} admin`
        );
      }
    }
  };

  // Handle admin deletion
  const handleDelete = async (adminId) => {
    // Check if user is super_admin before allowing delete
    if (!isSuperAdmin) {
      toast.error("Access denied. Only super_admin can delete admin users.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this admin?")) {
      try {
        await adminService.deleteAdmin(adminId);
        const updatedAdmins = admins.filter((admin) => admin.id !== adminId);
        setAdmins(updatedAdmins);
        toast.success("Admin deleted successfully");
      } catch (error) {
        console.error("Error deleting admin:", error);

        // Handle authorization errors specifically
        if (error.response?.status === 403) {
          toast.error(
            "Access denied. Only super_admin can delete admin users."
          );
        } else {
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Failed to delete admin"
          );
        }
      }
    }
  };

  // Filter admins based on search term and status filter
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || admin.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Show access denied message if user is not super_admin
  if (!isSuperAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Management</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <RiShieldUserLine className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Access Denied
          </h3>
          <p className="text-red-600">
            Only super_admin users can access admin management. Your current
            user type is: {user?.user_type || "unknown"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Admin Management</h1>
        <button
          className="btn-primary flex items-center"
          onClick={openAddModal}
        >
          <RiUserAddLine className="mr-2" />
          Add New Admin
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search admins..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="sm:w-64">
          <div className="relative">
            <RiFilterLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="input pl-10 appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="card-glass overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No admins found matching your criteria
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                            <RiShieldUserLine className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {admin.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Since {formatDate(admin.created_at).split(",")[0]}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{admin.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {admin.roles?.name || "No Role"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {admin.roles?.description || ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                        {admin.user_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${
                          admin.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {admin.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(admin)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <RiEdit2Line className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <RiDeleteBinLine className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {modalMode === "add" ? "Add New Admin" : "Edit Admin"}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <RiCloseLine className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>
                  {modalMode === "add" && (
                    <div className="mb-4">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="input"
                        required={modalMode === "add"}
                        minLength={6}
                      />
                    </div>
                  )}
                  <div className="mb-4">
                    <label
                      htmlFor="user_type"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      User Type
                    </label>
                    <select
                      id="user_type"
                      name="user_type"
                      value={formData.user_type}
                      onChange={handleChange}
                      className="input"
                      required
                    >
                      {allowedAdminUserTypes.map((userType) => (
                        <option key={userType.value} value={userType.value}>
                          {userType.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <strong>Note:</strong> The role will be automatically
                      assigned based on the selected user type.
                    </div>
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      {modalMode === "add" ? "Add Admin" : "Update Admin"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
