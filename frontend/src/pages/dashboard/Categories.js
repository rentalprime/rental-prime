import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import categoryService from "../../services/categoryService";
import {
  RiAddLine,
  RiEdit2Line,
  RiDeleteBinLine,
  RiSearchLine,
  RiCloseLine,
  RiImageAddLine,
  RiFilterLine,
  RiRefreshLine,
  RiCheckLine,
} from "react-icons/ri";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    iconType: "emoji", // 'emoji' or 'image'
    status: "active",
    parent_id: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sortOrder, setSortOrder] = useState("name-asc"); // Default: sort by name ascending
  // Parent categories for dropdown
  const [parentCategories, setParentCategories] = useState([]);
  // View mode: 'flat', 'tree', or 'grouped'
  const [viewMode, setViewMode] = useState("flat");
  // Category tree for hierarchical view
  const [categoryTree, setCategoryTree] = useState([]);
  // For grouped view - current parent category being viewed
  const [currentParentId, setCurrentParentId] = useState(null);

  // Helper function to process icon data from backend response
  const processIconData = (category) => {
    let icon = "📁"; // Default folder icon
    let iconType = "emoji";

    if (category.image_url) {
      if (category.image_url.startsWith("emoji:")) {
        // Extract emoji from the prefixed format
        icon = category.image_url.substring(6); // Remove 'emoji:' prefix
        iconType = "emoji";
      } else {
        // It's an image URL (base64 or regular URL)
        icon = category.image_url;
        iconType = "image";
      }
    }

    return {
      ...category,
      icon,
      iconType,
      listingsCount: category.listings_count || 0,
      createdAt: category.created_at,
    };
  };

  // Common emoji choices for rental categories
  const commonEmojis = [
    { emoji: "🏢", name: "Office Building" },
    { emoji: "🏠", name: "House" },
    { emoji: "🏡", name: "House with Garden" },
    { emoji: "🏘️", name: "Multiple Houses" },
    { emoji: "🏚️", name: "Derelict House" },
    { emoji: "🏨", name: "Hotel" },
    { emoji: "🏪", name: "Convenience Store" },
    { emoji: "🏫", name: "School" },
    { emoji: "🏬", name: "Department Store" },
    { emoji: "🏭", name: "Factory" },
    { emoji: "⛪", name: "Church" },
    { emoji: "🏛️", name: "Classical Building" },
    { emoji: "🏥", name: "Hospital" },
    { emoji: "🏤", name: "Post Office" },
    { emoji: "🏣", name: "Japanese Post Office" },
    { emoji: "🏰", name: "Castle" },
    { emoji: "🏯", name: "Japanese Castle" },
    { emoji: "🏟️", name: "Stadium" },
    { emoji: "🏗️", name: "Construction" },
    { emoji: "🏂", name: "Snowboarder" },
    { emoji: "🏊", name: "Swimming" },
    { emoji: "🚗", name: "Car" },
    { emoji: "🚌", name: "Bus" },
    { emoji: "🏍️", name: "Motorcycle" },
    { emoji: "🚲", name: "Bicycle" },
    { emoji: "⛺", name: "Tent" },
    { emoji: "🏕️", name: "Camping" },
    { emoji: "📱", name: "Mobile Phone" },
    { emoji: "💻", name: "Laptop" },
    { emoji: "📷", name: "Camera" },
    { emoji: "🎸", name: "Guitar" },
    { emoji: "🎹", name: "Piano" },
    { emoji: "🧳", name: "Luggage" },
    { emoji: "🛋️", name: "Couch and Lamp" },
    { emoji: "🪑", name: "Chair" },
    { emoji: "🛏️", name: "Bed" },
    { emoji: "🛁", name: "Bathtub" },
    { emoji: "🚿", name: "Shower" },
    { emoji: "🏝️", name: "Desert Island" },
    { emoji: "🏔️", name: "Mountain" },
    { emoji: "🌊", name: "Ocean Wave" },
  ];

  // Fetch categories on component mount and when filters change
  // Initial data loading
  useEffect(() => {
    fetchCategories();
    fetchParentCategories();
  }, []);

  useEffect(() => {
    if (viewMode === "tree") {
      fetchCategoryTree();
    }
  }, [searchTerm, viewMode]);

  // Render a single category in the tree view
  const renderCategoryNode = (category) => {
    return (
      <div key={category.id} className="mb-3">
        <div className="flex items-center p-2 hover:bg-gray-50 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="w-10 h-10 flex items-center justify-center mr-3 overflow-hidden bg-gray-50 rounded-md">
            {category.iconType === "image" ? (
              <img
                src={category.icon || ""}
                alt={category.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-2xl">{String(category.icon || "📁")}</span>
            )}
          </div>
          <div className="flex-1">
            <span className="font-medium text-gray-800">{category.name}</span>
            {category.description && (
              <p className="text-xs text-gray-500 mt-1">
                {category.description}
              </p>
            )}
            {/* Show type badge */}
            <div className="flex items-center mt-1 space-x-2">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                {category.parent_id ? "Subcategory" : "Main Category"}
              </span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  category.status === "active"
                    ? "bg-green-50 text-green-700"
                    : "bg-yellow-50 text-yellow-700"
                }`}
              >
                {category.status}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => openEditModal(category)}
              className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
              title="Edit category"
            >
              <RiEdit2Line className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(category.id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Delete category"
            >
              <RiDeleteBinLine className="w-4 h-4" />
            </button>
          </div>
        </div>

        {category.children && category.children.length > 0 && (
          <div className="pl-6 border-l-2 border-blue-200 ml-5 mt-2">
            <div className="text-xs text-gray-500 mb-2 ml-2">
              {category.children.length} Subcategories
            </div>
            {category.children.map((child) => renderCategoryNode(child))}
          </div>
        )}
      </div>
    );
  };

  // Fetch parent categories for dropdown
  const fetchParentCategories = async () => {
    try {
      const data = await categoryService.getParentCategories();
      setParentCategories(data);
    } catch (error) {
      console.error("Error fetching parent categories:", error);
      toast.error("Failed to load parent categories");
    }
  };

  // Fetch category tree for hierarchical view
  const fetchCategoryTree = async () => {
    try {
      console.log("Fetching category tree...");

      const data = await categoryService.getCategoryTree();
      console.log("Raw tree data:", data);

      // Process the data to ensure icons are properly formatted for rendering
      const processedTree = processCategoryTreeIcons(data);
      console.log("Processed tree with icons:", processedTree);

      setCategoryTree(processedTree);
    } catch (error) {
      console.error("Error fetching category tree:", error);
      toast.error("Failed to load category tree");
    }
  };

  // Process the category tree to ensure icons are properly formatted for rendering
  const processCategoryTreeIcons = (categories) => {
    return categories.map((category) => {
      // Use the processIconData helper to extract icon information
      const processedCategory = processIconData(category);

      // Process children recursively if they exist
      const children = category.children
        ? processCategoryTreeIcons(category.children)
        : [];

      return {
        ...processedCategory,
        children,
      };
    });
  };

  // Function to fetch categories with optional filters
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const filters = {
        search: searchTerm,
        status: "all", // We'll get all and filter in the UI
        orderBy: "created_at",
        orderDirection: "desc",
      };

      const data = await categoryService.getCategories(filters);

      // Transform the data using the processIconData helper
      const transformedData = data.map((category) => processIconData(category));

      setCategories(transformedData);
      console.log("Categories loaded:", transformedData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error(
        `Failed to fetch categories: ${error.message || "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Resize image to appropriate dimensions for category icon
  const resizeImage = (dataUrl, maxWidth = 64, maxHeight = 64) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Create canvas for resizing
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        // Draw resized image to canvas
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to data URL (PNG for better quality)
        const resizedDataUrl = canvas.toDataURL("image/png", 0.9);
        resolve(resizedDataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
    });
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle image file uploads
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image is too large. Maximum size is 2MB.");
      return;
    }

    // Check file type
    if (!file.type.match("image.*")) {
      toast.error("Only image files are allowed.");
      return;
    }

    try {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          // Resize image before storing
          const resizedImage = await resizeImage(event.target.result, 64, 64);

          setFormData({
            ...formData,
            icon: resizedImage,
            iconType: "image",
          });

          toast.success("Image uploaded and resized successfully");
        } catch (error) {
          console.error("Error resizing image:", error);
          toast.error("Failed to process image");
        }
      };

      reader.onerror = () => {
        toast.error("Failed to read image file");
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error handling image upload:", error);
      toast.error("Failed to upload image");
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setFormData({
      ...formData,
      icon: emoji,
      iconType: "emoji",
    });
    setShowEmojiPicker(false);
    console.log("Selected emoji:", emoji);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Open modal for adding a new category
  const openAddModal = () => {
    setFormData({
      name: "",
      description: "",
      icon: "",
      iconType: "emoji",
      status: "active",
      parent_id: null,
    });
    setShowEmojiPicker(false);
    setModalMode("add");
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "",
      iconType: category.iconType || "emoji",
      status: category.status || "active",
      parent_id: category.parent_id || null,
    });
    setShowEmojiPicker(false);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    // Prepare icon data for backend
    let iconData = null;
    if (formData.icon) {
      if (formData.iconType === "emoji") {
        // For emojis, store with a special prefix to distinguish from image URLs
        iconData = `emoji:${formData.icon}`;
      } else if (formData.iconType === "image") {
        // For images, store the base64 data URL directly
        iconData = formData.icon;
      }
    }

    const dbFormData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      status: formData.status,
      parent_id: formData.parent_id,
      image_url: iconData, // Send icon data to backend
    };
    try {
      if (modalMode === "add") {
        const newCategory = await categoryService.createCategory(dbFormData);
        if (!newCategory) {
          toast.error("Failed to create category");
          return;
        }

        // Process the returned category to extract icon data
        const processedCategory = processIconData(newCategory);
        setCategories([processedCategory, ...categories]);
        toast.success("Category added successfully");
      } else if (modalMode === "edit" && currentCategory) {
        const updatedCategory = await categoryService.updateCategory(
          currentCategory.id,
          dbFormData
        );
        if (!updatedCategory) {
          toast.error("Failed to update category");
          return;
        }

        // Process the returned category to extract icon data
        const processedCategory = processIconData(updatedCategory);

        // Update the categories state with the updated category
        setCategories(
          categories.map((category) =>
            category.id === currentCategory.id ? processedCategory : category
          )
        );

        // Always refresh both views to ensure icons are up to date
        fetchCategories(); // Refresh the flat view

        // Also refresh tree view if needed
        if (viewMode === "tree") {
          fetchCategoryTree();
        }

        toast.success("Category updated successfully");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category");
    } finally {
      setShowModal(false);
    }
  };

  const handleSortChange = (newSortOrder) => {
    setSortOrder(newSortOrder);
  };

  const refreshCategories = () => {
    fetchCategories();
    toast.success("Categories refreshed");
  };

  // Handle category deletion
  const handleDelete = async (categoryId) => {
    if (!categoryId) return;

    // Ask for confirmation before deletion
    if (
      !window.confirm(
        "Are you sure you want to delete this category? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await categoryService.deleteCategory(categoryId);

      // Remove the category from the state
      setCategories(
        categories.filter((category) => category.id !== categoryId)
      );

      // If we're in tree view, refresh the tree
      if (viewMode === "tree") {
        fetchCategoryTree();
      }

      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(
        `Failed to delete category: ${error.message || "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter categories based on current view mode and filters
  const filterCategories = () => {
    // First apply search filter
    let filtered = categories.filter((category) => {
      // Skip search filter if search term is empty
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        category.name.toLowerCase().includes(search) ||
        (category.description &&
          category.description.toLowerCase().includes(search))
      );
    });

    // Then apply parent filter for grouped view
    if (viewMode === "grouped") {
      filtered = filtered.filter(
        (category) =>
          currentParentId === null
            ? category.parent_id === null || !category.parent_id // Show top-level categories when no parent selected
            : category.parent_id === currentParentId // Show child categories of selected parent
      );
    }

    // Then sort the filtered list
    return filtered.sort((a, b) => {
      const [field, direction] = sortOrder.split("-");
      const multiplier = direction === "asc" ? 1 : -1;
      switch (field) {
        case "name":
          return multiplier * a.name.localeCompare(b.name);
        case "status":
          return multiplier * a.status.localeCompare(b.status);
        case "created":
          return (
            multiplier *
            (new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime())
          );
        default:
          return 0;
      }
    });
  };

  const filteredAndSortedCategories = filterCategories();

  // Get parent categories for grouping and filtering
  const mainCategories = categories.filter((c) => !c.parent_id);

  // Handle parent category selection for grouped view
  const handleParentSelect = (parentId) => {
    setCurrentParentId(parentId);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center"
        >
          <RiAddLine className="mr-1" /> Add New Category
        </button>
      </div>

      <div className="card-glass mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex space-x-2">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => handleSortChange(e.target.value)}
                className="input px-3 py-2 pr-8 appearance-none bg-white"
                disabled={loading}
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="status-asc">Status (Active first)</option>
                <option value="status-desc">Status (Inactive first)</option>
                <option value="created-desc">Newest first</option>
                <option value="created-asc">Oldest first</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>

            <button
              onClick={refreshCategories}
              className="btn-outline flex items-center"
              disabled={loading}
            >
              <RiRefreshLine
                className={`mr-1 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* View toggles and filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="text-sm text-gray-500 mb-2">
              {filteredAndSortedCategories.length} categories found{" "}
              {viewMode === "grouped" &&
                currentParentId &&
                "(filtered by parent)"}
            </div>

            {/* View mode selection */}
            <div className="flex space-x-1 mb-2 md:mb-0">
              <button
                onClick={() => {
                  setViewMode("flat");
                  setCurrentParentId(null);
                }}
                className={`px-3 py-1 rounded-md text-xs md:text-sm ${
                  viewMode === "flat"
                    ? "bg-primary-100 text-primary-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => {
                  setViewMode("tree");
                  setCurrentParentId(null);
                }}
                className={`px-3 py-1 rounded-md text-xs md:text-sm ${
                  viewMode === "tree"
                    ? "bg-primary-100 text-primary-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Tree View
              </button>
              <button
                onClick={() => {
                  setViewMode("grouped");
                  setCurrentParentId(null);
                }}
                className={`px-3 py-1 rounded-md text-xs md:text-sm ${
                  viewMode === "grouped"
                    ? "bg-primary-100 text-primary-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Grouped View
              </button>
            </div>
          </div>

          {/* Parent category selector for grouped view */}
          {viewMode === "grouped" && (
            <div className="w-full md:w-auto">
              <div className="flex items-center">
                <label className="text-sm text-gray-700 mr-2">Parent:</label>
                <select
                  className="input max-w-xs text-sm"
                  value={currentParentId || ""}
                  onChange={(e) => handleParentSelect(e.target.value || null)}
                >
                  <option value="">Top-level categories</option>
                  {mainCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Categories View (Grid, Tree or Grouped) */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredAndSortedCategories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No categories found matching your criteria
        </div>
      ) : viewMode === "tree" ? (
        <div className="card-glass p-4">
          <div className="mb-4 pb-3 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">
              Category Hierarchy
            </h3>
            <p className="text-sm text-gray-500">
              Showing full category structure with parent-child relationships
            </p>
          </div>
          {categoryTree.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No categories found. Add some categories to see the hierarchy.
            </div>
          ) : (
            categoryTree.map((category) => renderCategoryNode(category))
          )}
        </div>
      ) : viewMode === "grouped" ? (
        <div>
          {/* Group header */}
          <div className="card-glass p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-800">
                  {currentParentId
                    ? `Subcategories of ${
                        categories.find((c) => c.id === currentParentId)
                          ?.name || "Selected Category"
                      }`
                    : "Main Categories"}
                </h3>
                <p className="text-sm text-gray-500">
                  {currentParentId
                    ? "Showing subcategories of the selected parent category"
                    : "Showing main categories with no parent"}
                </p>
              </div>

              {/* Back button when viewing subcategories */}
              {currentParentId && (
                <button
                  onClick={() => setCurrentParentId(null)}
                  className="btn-outline text-sm flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Main Categories
                </button>
              )}
            </div>
          </div>

          {/* Tabular view for cleaner display of many categories */}
          <div className="card-glass overflow-hidden">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Listings
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md mr-3 overflow-hidden">
                          {category.iconType === "image" ? (
                            <img
                              src={category.icon}
                              alt={category.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-2xl">{category.icon}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">
                            {category.name}
                          </div>
                          {!currentParentId &&
                            !category.parent_id &&
                            categories.filter(
                              (c) => c.parent_id === category.id
                            ).length > 0 && (
                              <button
                                onClick={() => handleParentSelect(category.id)}
                                className="text-xs mt-1 flex items-center text-blue-600 hover:text-blue-800"
                              >
                                View{" "}
                                {
                                  categories.filter(
                                    (c) => c.parent_id === category.id
                                  ).length
                                }{" "}
                                subcategories
                              </button>
                            )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {category.description || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          category.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {category.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {category.listingsCount || 0}
                    </td>
                    <td className="px-4 py-4 flex space-x-2">
                      <button
                        onClick={() => openEditModal(category)}
                        className="p-1 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                        title="Edit"
                      >
                        <RiEdit2Line className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <RiDeleteBinLine className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedCategories.map((category) => (
            <div
              key={category.id}
              className="card-glass hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="w-14 h-14 flex items-center justify-center bg-gray-50 rounded-md mr-3 overflow-hidden">
                    {category.iconType === "image" ? (
                      <img
                        src={category.icon}
                        alt={category.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-4xl">{category.icon}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {category.description}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full 
                  ${
                    category.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {category.status}
                </span>
              </div>

              <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                <div>
                  <span className="font-medium">{category.listingsCount}</span>{" "}
                  listings
                </div>
                <div>Created: {formatDate(category.createdAt)}</div>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => openEditModal(category)}
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                >
                  <RiEdit2Line className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <RiDeleteBinLine className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Category Modal */}
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
                    {modalMode === "add" ? "Add New Category" : "Edit Category"}
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
                      Category Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
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
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="input"
                      rows="3"
                    ></textarea>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="icon"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Icon
                    </label>
                    <div className="flex flex-col space-y-3">
                      {/* Icon Preview */}
                      <div className="flex items-center mb-2">
                        <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-md mr-3 border border-gray-200 overflow-hidden">
                          {formData.icon ? (
                            formData.iconType === "image" ? (
                              <img
                                src={formData.icon}
                                alt="Category icon"
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span className="text-3xl">{formData.icon}</span>
                            )
                          ) : (
                            <RiImageAddLine className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700">
                            {formData.icon
                              ? formData.iconType === "image"
                                ? "Custom Image Icon"
                                : "Emoji Icon"
                              : "No icon selected"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formData.iconType === "image"
                              ? "Image will be resized to 64x64px"
                              : "Emoji will display at various sizes depending on device"}
                          </div>
                        </div>
                      </div>

                      {/* Icon Selection Options */}
                      <div className="flex space-x-2">
                        {/* Emoji Selector Button */}
                        <button
                          type="button"
                          className="flex-1 p-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 flex items-center justify-center"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                          <span className="mr-2">😀</span> Choose Emoji
                        </button>

                        {/* Image Upload Button */}
                        <label className="flex-1 p-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-colors">
                          <RiImageAddLine className="w-5 h-5 mr-2" /> Upload
                          Image
                          <input
                            type="file"
                            name="iconImage"
                            className="hidden"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleImageUpload}
                          />
                        </label>
                      </div>

                      {/* Emoji Picker */}
                      {showEmojiPicker && (
                        <div className="mt-2 p-3 border border-gray-200 rounded-md bg-white max-h-60 overflow-y-auto">
                          <div className="grid grid-cols-8 gap-2">
                            {commonEmojis.map((item, index) => (
                              <button
                                key={index}
                                type="button"
                                className="p-2 hover:bg-gray-100 rounded-md flex items-center justify-center text-xl"
                                title={item.name}
                                onClick={() => handleEmojiSelect(item.emoji)}
                              >
                                {item.emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Clear Icon Button */}
                      {formData.icon && (
                        <button
                          type="button"
                          className="text-sm text-red-600 hover:text-red-800 flex items-center"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              icon: "",
                              iconType: "emoji",
                            })
                          }
                        >
                          <RiCloseLine className="w-4 h-4 mr-1" /> Clear icon
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="parent_id"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Parent Category
                    </label>
                    <select
                      id="parent_id"
                      name="parent_id"
                      value={formData.parent_id || ""}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="">No Parent (Main Category)</option>
                      {parentCategories.map((parent) =>
                        // Don't show current category as a parent option when editing
                        currentCategory &&
                        currentCategory.id === parent.id ? null : (
                          <option key={parent.id} value={parent.id}>
                            {parent.name}
                          </option>
                        )
                      )}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Select a parent category to create a subcategory or leave
                      empty for a main category
                    </p>
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

                  <div className="flex justify-end mt-4 space-x-3">
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={!formData.name.trim()}
                    >
                      {modalMode === "add" ? "Add Category" : "Update Category"}
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

export default Categories;
