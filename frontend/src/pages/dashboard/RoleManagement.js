import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import roleService from "../../services/roleService";
import { useNavigate } from "react-router-dom";
import {
  RiAddLine,
  RiEdit2Line,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine,
  RiSearchLine,
} from "react-icons/ri";

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [currentRole, setCurrentRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
    permissions: [],
  });
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      console.log("Fetching roles from Supabase...");
      const data = await roleService.getAllRoles();

      if (data && data.length > 0) {
        // Ensure permissions field is an array
        const processedData = data.map((role) => ({
          ...role,
          permissions: Array.isArray(role.permissions) ? role.permissions : [],
        }));

        setRoles(processedData);
        console.log("Roles loaded successfully:", processedData);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to fetch roles from API");
      setRoles([]); // Set empty array on error instead of mock data
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Open modal for adding a new role
  const openAddModal = () => {
    setModalMode("add");
    setFormData({
      name: "",
      description: "",
      status: "active",
      permissions: [],
    });
    setShowModal(true);
  };

  // Open modal for editing a role
  const openEditModal = (role) => {
    setModalMode("edit");
    setCurrentRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
      status: role.status || "active",
    });
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    // Prepare role data
    const roleData = {
      ...formData,
      is_system_role: false, // New roles created through UI are never system roles
    };

    try {
      if (modalMode === "add") {
        // Add role
        console.log("Creating new role:", roleData);
        const newRole = await roleService.createRole(roleData);

        if (newRole) {
          setRoles([...roles, newRole]);
          toast.success("Role added successfully");
          setShowModal(false);
          setFormData({
            name: "",
            description: "",
            status: "active",
            permissions: [],
          });
        }
      } else {
        // Update role - only if not a system role or only updating allowed fields
        if (currentRole.is_system_role) {
          // For system roles, only the description can be updated
          roleData.name = currentRole.name; // Preserve original name
          roleData.status = currentRole.status; // Preserve original status
          roleData.permissions = currentRole.permissions; // Preserve original permissions
          roleData.is_system_role = true; // Preserve system role flag
        }

        console.log("Updating role:", roleData);
        const updatedRole = await roleService.updateRole(
          currentRole.id,
          roleData
        );

        if (updatedRole) {
          setRoles(
            roles.map((role) =>
              role.id === currentRole.id
                ? {
                    ...role,
                    ...updatedRole,
                  }
                : role
            )
          );
          toast.success("Role updated successfully");
          setShowModal(false);
          setFormData({
            name: "",
            description: "",
            status: "active",
            permissions: [],
          });
        }
      }
    } catch (error) {
      console.error("Error saving role:", error);
      toast.error(`Failed to save role: ${error.message || "Unknown error"}`);
    }
  };

  // Handle role deletion
  const handleDelete = async (roleId) => {
    // Find the role to check if it's a system role
    const roleToDelete = roles.find((role) => role.id === roleId);

    if (roleToDelete?.is_system_role) {
      toast.error("System roles cannot be deleted");
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to delete this role? This action cannot be undone."
      )
    ) {
      try {
        console.log("Deleting role:", roleId);
        await roleService.deleteRole(roleId);
        setRoles(roles.filter((role) => role.id !== roleId));
        toast.success("Role deleted successfully");
      } catch (error) {
        console.error("Error deleting role:", error);
        toast.error(
          `Failed to delete role: ${error.message || "Unknown error"}`
        );
      }
    }
  };

  // Filter roles based on search term
  const filteredRoles = searchTerm
    ? roles.filter(
        (role) =>
          role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (role.description &&
            role.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : roles;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Role Management</h1>
        <div>
          <button
            className="btn-primary flex items-center"
            onClick={openAddModal}
          >
            <RiAddLine className="mr-1" /> Add New Role
          </button>
          {loading && (
            <p className="text-sm text-gray-500 mt-1 text-right">
              Loading roles...
            </p>
          )}
        </div>
      </div>

      {/* Search and filters */}
      <div className="mb-6 flex items-center bg-white p-4 rounded-lg shadow-sm">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search roles..."
            className="input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Roles table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  System Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredRoles.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No roles found
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {role.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {role.description || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {role.is_system_role ? (
                        <span className="flex items-center text-green-600">
                          <RiCheckLine className="mr-1" /> Yes
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600">
                          <RiCloseLine className="mr-1" /> No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          role.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {role.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(role)}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={role.is_system_role}
                          title={
                            role.is_system_role
                              ? "System roles cannot be edited"
                              : "Edit role"
                          }
                        >
                          <RiEdit2Line className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(role.id)}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={role.is_system_role}
                          title={
                            role.is_system_role
                              ? "System roles cannot be deleted"
                              : "Delete role"
                          }
                        >
                          <RiDeleteBinLine className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Role Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div
                className="absolute inset-0 bg-gray-500 opacity-75"
                onClick={() => setShowModal(false)}
              ></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {modalMode === "add" ? "Add New Role" : "Edit Role"}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Role Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input"
                      required
                      disabled={
                        modalMode === "edit" && currentRole?.is_system_role
                      }
                    />
                    {modalMode === "edit" && currentRole?.is_system_role && (
                      <p className="mt-1 text-xs text-gray-500">
                        System role names cannot be changed
                      </p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="input"
                      rows="3"
                      placeholder="Describe the purpose of this role"
                    ></textarea>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Permissions
                    </label>
                    <div className="grid grid-cols-2 gap-2 border p-3 rounded-md bg-gray-50">
                      {[
                        "users",
                        "admins",
                        "listings",
                        "categories",
                        "payments",
                        "plans",
                        "settings",
                        "support",
                      ].map((permission) => (
                        <div key={permission} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`permission-${permission}`}
                            name={`permission-${permission}`}
                            checked={formData.permissions?.includes(permission)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  permissions: [
                                    ...(formData.permissions || []),
                                    permission,
                                  ],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  permissions: (
                                    formData.permissions || []
                                  ).filter((p) => p !== permission),
                                });
                              }
                            }}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            disabled={
                              modalMode === "edit" &&
                              currentRole?.is_system_role
                            }
                          />
                          <label
                            htmlFor={`permission-${permission}`}
                            className="ml-2 block text-sm text-gray-700 capitalize"
                          >
                            {permission}
                          </label>
                        </div>
                      ))}
                    </div>
                    {modalMode === "edit" && currentRole?.is_system_role && (
                      <p className="mt-1 text-xs text-gray-500">
                        System role permissions cannot be modified
                      </p>
                    )}
                  </div>

                  {modalMode === "edit" && (
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
                        disabled={currentRole?.is_system_role}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      {currentRole?.is_system_role && (
                        <p className="mt-1 text-xs text-gray-500">
                          System role status cannot be changed
                        </p>
                      )}
                    </div>
                  )}
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      {modalMode === "add" ? "Add Role" : "Update Role"}
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

export default RoleManagement;
