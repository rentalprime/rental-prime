import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  RiAddLine,
  RiEdit2Line,
  RiDeleteBinLine,
  RiCloseLine,
  RiCheckLine,
  RiTimeLine,
} from "react-icons/ri";
import planService from "../../services/planService";

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [currentPlan, setCurrentPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    interval: "monthly",
    features: {
      users: "",
      support: "email",
      featured: "",
      listings: "",
      analytics: false,
    },
    status: "active",
  });

  // Fetch plans on component mount
  useEffect(() => {
    fetchPlans();
  }, []);

  // Fetch plans from API
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await planService.getPlans();

      // Transform data to match expected format
      const transformedPlans = data.map((plan) => ({
        ...plan,
        _id: plan.id, // Map id to _id for compatibility
        createdAt: plan.created_at, // Map created_at to createdAt
        // Keep features in their original format for proper editing
        features: plan.features || {},
        subscribers: plan.subscribers || 0,
      }));

      setPlans(transformedPlans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to fetch plans. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("features.")) {
      const featureKey = name.split(".")[1];
      setFormData({
        ...formData,
        features: {
          ...formData.features,
          [featureKey]: type === "checkbox" ? checked : value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  // Open modal for adding a new plan
  const openAddModal = () => {
    setModalMode("add");
    setFormData({
      name: "",
      description: "",
      price: "",
      interval: "monthly",
      features: {
        users: "",
        support: "email",
        featured: "",
        listings: "",
        analytics: false,
      },
      status: "active",
    });
    setShowModal(true);
  };

  // Open modal for editing a plan
  const openEditModal = (plan) => {
    setModalMode("edit");
    setCurrentPlan(plan);

    // Handle both old array format and new object format for features
    let featuresData = {
      users: "",
      support: "email",
      featured: "",
      listings: "",
      analytics: false,
    };

    if (plan.features) {
      if (Array.isArray(plan.features)) {
        // Old format - convert array to object (fallback)
        featuresData = {
          users: "",
          support: "email",
          featured: "",
          listings: "",
          analytics: false,
        };
      } else if (typeof plan.features === "object" && plan.features !== null) {
        // New format - use the object directly
        featuresData = {
          users: plan.features.users?.toString() || "",
          support: plan.features.support || "email",
          featured: plan.features.featured?.toString() || "",
          listings: plan.features.listings?.toString() || "",
          analytics: Boolean(plan.features.analytics),
        };
      }
    }

    const formDataToSet = {
      name: plan.name || "",
      description: plan.description || "",
      price: plan.price?.toString() || "",
      interval: plan.interval || "monthly",
      features: featuresData,
      status: plan.status || "active",
    };

    setFormData(formDataToSet);
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required feature fields
    if (!formData.features.users || !formData.features.listings) {
      toast.error(
        "Please fill in all required feature fields (users and listings)"
      );
      return;
    }

    // Parse price to number
    const priceNumber = parseFloat(formData.price);

    if (isNaN(priceNumber) || priceNumber <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    // Validate and convert feature values
    const featuresObject = {
      users: parseInt(formData.features.users) || 0,
      support: formData.features.support,
      featured: parseInt(formData.features.featured) || 0,
      listings: parseInt(formData.features.listings) || 0,
      analytics: formData.features.analytics,
    };

    try {
      const planData = {
        name: formData.name,
        description: formData.description,
        price: priceNumber,
        interval: formData.interval,
        features: featuresObject,
        status: formData.status,
      };

      if (modalMode === "add") {
        // Create new plan via API
        await planService.createPlan(planData);
        toast.success("Plan added successfully");
      } else {
        // Update existing plan via API
        await planService.updatePlan(
          currentPlan.id || currentPlan._id,
          planData
        );
        toast.success("Plan updated successfully");
      }

      // Refresh plans list
      await fetchPlans();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving plan:", error);
      toast.error(error.message || "Failed to save plan. Please try again.");
    }
  };

  // Handle plan deletion
  const handleDelete = async (planId) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        // Find the plan to get the real ID
        const plan = plans.find((p) => p._id === planId);
        const realId = plan?.id || planId;

        await planService.deletePlan(realId);
        toast.success("Plan deleted successfully");

        // Refresh plans list
        await fetchPlans();
      } catch (error) {
        console.error("Error deleting plan:", error);
        toast.error(
          error.message || "Failed to delete plan. Please try again."
        );
      }
    }
  };

  // Format price with currency (Indian Rupee)
  const formatPrice = (price, interval) => {
    // Convert USD to INR (approximate exchange rate: 1 USD = 75 INR)
    const inrAmount = price * 75;

    // Map interval to display suffix
    const intervalSuffix = {
      monthly: "/mo",
      quarterly: "/qtr",
      "half-yearly": "/6mo",
      yearly: "/yr",
    };

    return (
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(inrAmount) + (intervalSuffix[interval] || "/mo")
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Pricing Plans</h1>
        <button
          className="btn-primary flex items-center"
          onClick={openAddModal}
        >
          <RiAddLine className="mr-2" />
          Add New Plan
        </button>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No pricing plans found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="card-glass hover:shadow-lg transition-shadow duration-300 relative"
            >
              {plan.status === "inactive" && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                  Inactive
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                <p className="text-gray-600 mt-1">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold text-primary-600">
                  {formatPrice(plan.price, plan.interval)}
                </span>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Features:
                </h4>
                <ul className="space-y-2">
                  {Array.isArray(plan.features) ? (
                    // Old format - array of strings
                    plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <RiCheckLine className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))
                  ) : plan.features && typeof plan.features === "object" ? (
                    // New format - object with structured data
                    <>
                      <li className="flex items-start">
                        <RiCheckLine className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">
                          Max Users: {plan.features.users}
                        </span>
                      </li>
                      <li className="flex items-start">
                        <RiCheckLine className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">
                          Max Listings: {plan.features.listings}
                        </span>
                      </li>
                      <li className="flex items-start">
                        <RiCheckLine className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">
                          Featured Listings: {plan.features.featured}
                        </span>
                      </li>
                      <li className="flex items-start">
                        <RiCheckLine className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">
                          Support: {plan.features.support}
                        </span>
                      </li>
                      <li className="flex items-start">
                        {plan.features.analytics ? (
                          <RiCheckLine className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        ) : (
                          <RiCloseLine className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="text-sm text-gray-600">
                          Analytics Access
                        </span>
                      </li>
                    </>
                  ) : (
                    <li className="text-sm text-gray-500">
                      No features defined
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <RiTimeLine className="w-4 h-4 mr-1" />
                  <span>Created: {formatDate(plan.createdAt)}</span>
                </div>
                <div>
                  <span className="font-medium">{plan.subscribers}</span>{" "}
                  subscribers
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => openEditModal(plan)}
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                >
                  <RiEdit2Line className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(plan._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <RiDeleteBinLine className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Plan Modal */}
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
                    {modalMode === "add" ? "Add New Plan" : "Edit Plan"}
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
                      Plan Name
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
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Description
                    </label>
                    <input
                      type="text"
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="price"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Price
                      </label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="input"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="interval"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Billing Interval
                      </label>
                      <select
                        id="interval"
                        name="interval"
                        value={formData.interval}
                        onChange={handleChange}
                        className="input"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="half-yearly">Half-Yearly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Plan Features
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="features.users"
                          className="block text-sm font-medium text-gray-600 mb-1"
                        >
                          Max Users *
                        </label>
                        <input
                          type="number"
                          id="features.users"
                          name="features.users"
                          value={formData.features.users}
                          onChange={handleChange}
                          className="input"
                          min="1"
                          required
                          placeholder="e.g., 1"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="features.listings"
                          className="block text-sm font-medium text-gray-600 mb-1"
                        >
                          Max Listings *
                        </label>
                        <input
                          type="number"
                          id="features.listings"
                          name="features.listings"
                          value={formData.features.listings}
                          onChange={handleChange}
                          className="input"
                          min="1"
                          required
                          placeholder="e.g., 2"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="features.featured"
                          className="block text-sm font-medium text-gray-600 mb-1"
                        >
                          Featured Listings
                        </label>
                        <input
                          type="number"
                          id="features.featured"
                          name="features.featured"
                          value={formData.features.featured}
                          onChange={handleChange}
                          className="input"
                          min="0"
                          placeholder="e.g., 1"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="features.support"
                          className="block text-sm font-medium text-gray-600 mb-1"
                        >
                          Support Type
                        </label>
                        <select
                          id="features.support"
                          name="features.support"
                          value={formData.features.support}
                          onChange={handleChange}
                          className="input"
                        >
                          <option value="email">Email</option>
                          <option value="chat">Chat</option>
                          <option value="phone">Phone</option>
                          <option value="priority">Priority</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="features.analytics"
                            checked={formData.features.analytics}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm font-medium text-gray-600">
                            Analytics Access
                          </span>
                        </label>
                      </div>
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
                      {modalMode === "add" ? "Add Plan" : "Update Plan"}
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

export default Plans;
