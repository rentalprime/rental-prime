import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  RiAddLine,
  RiEdit2Line,
  RiDeleteBinLine,
  RiSearchLine,
  RiFilterLine,
  RiEyeLine,
  RiCloseLine,
} from "react-icons/ri";
import listingService from "../../services/listingService";

import categoryService from "../../services/categoryService";

// API base URL for server requests
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

// Placeholder image as base64 SVG for fallback
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='300' height='150' viewBox='0 0 300 150'%3e%3crect fill='%23e2e8f0' width='300' height='150'/%3e%3ctext fill='%2364748b' font-family='Arial,sans-serif' font-size='14' font-weight='bold' text-anchor='middle' x='150' y='75'%3eImage Not Available%3c/text%3e%3c/svg%3e";

/**
 * Converts a relative or partial image path to a full URL
 * @param {string} path - The image path or URL
 * @returns {string} - The complete URL to the image
 */
const getImageUrl = (path) => {
  console.log("Processing image path:", path);

  // Return placeholder for empty paths
  if (!path) {
    console.log("Empty path, using placeholder");
    return PLACEHOLDER_IMAGE;
  }

  // If it's a base64 data URL, return it as is
  if (path.startsWith("data:")) {
    console.log("Path is a base64 data URL");
    return path;
  }

  // If it's already a full URL, return it as is
  if (path.startsWith("http")) {
    console.log("Path is already a full URL");
    return path;
  }

  // Ensure API_URL ends with a slash
  const baseUrl = API_URL.endsWith("/") ? API_URL : `${API_URL}/`;

  // Remove leading slash from path if present
  const imagePath = path.startsWith("/") ? path.substring(1) : path;

  // Combine to form the full URL
  const fullUrl = `${baseUrl}${imagePath}`;
  console.log("Converted to full URL:", fullUrl);

  return fullUrl;
};

const Listings = () => {
  const navigate = useNavigate();

  // All states declared at the top
  const [listings, setListings] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState({ min: "", max: "" });
  const [isFeaturedFilter, setIsFeaturedFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentListing, setCurrentListing] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category_id: "",
    subcategory_id: "",
    location: "",
    status: "active",
    is_featured: false,
    images: [],
  });

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewListing, setViewListing] = useState(null);

  // Handlers that depend on formData and other states

  // Resize image to appropriate dimensions for listing images
  const resizeImage = (dataUrl, maxWidth = 800, maxHeight = 600) => {
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

        // Convert canvas to data URL (JPEG for smaller file size)
        const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
        resolve(resizedDataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
    });
  };

  // Handle image upload for admin form
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 5 - (formData.images?.length || 0);

    if (files.length > maxImages) {
      toast.error(`You can only select ${maxImages} more images`);
      return;
    }

    const processedImages = [];

    for (const file of files) {
      try {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not a valid image file`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum size is 5MB`);
          continue;
        }

        const reader = new FileReader();

        const imageDataUrl = await new Promise((resolve, reject) => {
          reader.onload = (event) => resolve(event.target.result);
          reader.onerror = () => reject(new Error("Failed to read image file"));
          reader.readAsDataURL(file);
        });

        // Resize image before storing
        const resizedImage = await resizeImage(imageDataUrl, 800, 600);
        processedImages.push(resizedImage);
      } catch (error) {
        console.error("Error processing image:", error);
        toast.error(`Failed to process ${file.name}`);
      }
    }

    if (processedImages.length > 0) {
      setFormData({
        ...formData,
        images: [...(formData.images || []), ...processedImages],
      });
      toast.success(
        `${processedImages.length} image(s) uploaded and resized successfully`
      );
    }
  };

  // Remove image from form
  const removeImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      images: updatedImages,
    });
  };

  const openViewModal = (listing) => {
    console.log("Opening view modal with listing:", listing);

    // Process listing to handle JSON strings
    const processedListing = { ...listing };

    // Parse images if they're stored as a JSON string
    if (
      processedListing.images &&
      typeof processedListing.images === "string"
    ) {
      try {
        processedListing.images = JSON.parse(processedListing.images);
      } catch (e) {
        console.error("Error parsing images JSON:", e);
        processedListing.images = [];
      }
    } else if (!processedListing.images) {
      processedListing.images = [];
    }

    // Parse specifications if they're stored as a JSON string
    if (
      processedListing.specifications &&
      typeof processedListing.specifications === "string"
    ) {
      try {
        processedListing.specifications = JSON.parse(
          processedListing.specifications
        );
      } catch (e) {
        console.error("Error parsing specifications JSON:", e);
        processedListing.specifications = [];
      }
    } else if (!processedListing.specifications) {
      processedListing.specifications = [];
    }

    console.log("Processed listing images:", processedListing.images);
    setViewListing(processedListing);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewListing(null);
  };

  const openAddModal = () => {
    // Navigate to the new listing detail page instead of showing modal
    navigate("/listings/new");
  };

  const openEditModal = (listing) => {
    // Navigate to the edit page with the listing ID
    navigate(`/listings/edit/${listing.id}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare form data, ensuring images and specifications are properly formatted
      const preparedData = { ...formData };

      // Ensure images is an array
      if (typeof preparedData.images === "string") {
        try {
          preparedData.images = JSON.parse(preparedData.images);
        } catch (e) {
          preparedData.images = [];
        }
      }

      // Ensure specifications is an array
      if (typeof preparedData.specifications === "string") {
        try {
          preparedData.specifications = JSON.parse(preparedData.specifications);
        } catch (e) {
          preparedData.specifications = [];
        }
      }

      console.log("Submitting form data:", preparedData);

      if (modalMode === "add") {
        // Create new listing
        const result = await listingService.createListing(preparedData);
        if (result) {
          toast.success("Listing created successfully");
          setShowModal(false);
          fetchListings();
        }
      } else if (modalMode === "edit") {
        // Update existing listing
        const result = await listingService.updateListing(
          preparedData.id,
          preparedData
        );
        if (result) {
          toast.success("Listing updated successfully");
          setShowModal(false);
          fetchListings();
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Failed to save listing");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleDelete = async (listingId) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        setLoading(true);

        // Get the authentication token
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("You need to be logged in to delete a listing");
          return;
        }

        // Use the listing service for consistent API calls
        await listingService.deleteListing(listingId);

        // Update the UI
        setListings(listings.filter((listing) => listing.id !== listingId));
        toast.success("Listing deleted successfully");
      } catch (error) {
        console.error("Error deleting listing:", error);
        toast.error(`Failed to delete listing: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Fetch categories on mount
  useEffect(() => {
    // Fetch categories function moved to before useEffect
    fetchCategories();
  }, []);

  // Fetch subcategories when categoryFilter changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (categoryFilter === "all") {
        setSubcategories([]);
        setSubcategoryFilter("all");
        return;
      }
      try {
        const data = await categoryService.getSubcategories(categoryFilter);
        setSubcategories(data || []);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        toast.error("Failed to load subcategories");
        setSubcategories([]);
        setSubcategoryFilter("all");
      }
    };
    fetchSubcategories();
  }, [categoryFilter]);

  // Fetch listings when filters change
  useEffect(() => {
    // Fetch listings function moved to before useEffect
    fetchListings();
  }, [
    searchTerm,
    categoryFilter,
    subcategoryFilter,
    statusFilter,
    isFeaturedFilter,
    priceFilter,
    page,
    pageSize,
  ]);

  // Fetch categories from the API
  const fetchCategories = async () => {
    try {
      const data = await categoryService.getParentCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  // Fetch subcategories when a parent category is selected
  const fetchSubcategories = async () => {
    if (categoryFilter && categoryFilter !== "all") {
      try {
        const data = await categoryService.getSubcategories(categoryFilter);
        setSubcategories(data);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        toast.error("Failed to load subcategories");
      }
    } else {
      setSubcategories([]);
    }
  };

  // Fetch listings with filters
  const fetchListings = async () => {
    setLoading(true);
    try {
      const filters = {
        search: searchTerm,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        subcategory:
          subcategoryFilter !== "all" ? subcategoryFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        is_featured: isFeaturedFilter || undefined,
        minPrice: priceFilter.min || undefined,
        maxPrice: priceFilter.max || undefined,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        orderBy: "created_at",
        orderDirection: "desc",
      };
      console.log("Fetching listings with filters:", filters);

      // Use the listing service to fetch data
      const response = await listingService.getListings(filters);
      console.log("API response:", response);

      // Check if we have a valid response with data
      if (response && response.data && Array.isArray(response.data)) {
        // Extract the listings array from the response
        const listingsData = response.data;

        // Process each listing to handle JSON strings
        const processedListings = listingsData.map((listing) => {
          // Create a copy of the listing to avoid mutating the original
          const processedListing = { ...listing };

          // Parse images if they're stored as a JSON string
          if (
            processedListing.images &&
            typeof processedListing.images === "string"
          ) {
            try {
              processedListing.images = JSON.parse(processedListing.images);
            } catch (e) {
              console.error("Error parsing images JSON:", e);
              processedListing.images = [];
            }
          } else if (!processedListing.images) {
            processedListing.images = [];
          }

          // Parse specifications if they're stored as a JSON string
          if (
            processedListing.specifications &&
            typeof processedListing.specifications === "string"
          ) {
            try {
              processedListing.specifications = JSON.parse(
                processedListing.specifications
              );
            } catch (e) {
              console.error("Error parsing specifications JSON:", e);
              processedListing.specifications = [];
            }
          } else if (!processedListing.specifications) {
            processedListing.specifications = [];
          }

          return processedListing;
        });

        setListings(processedListings);
        console.log("Processed listings:", processedListings);

        // Use the count from the API response for pagination
        const totalItems = response.count || listingsData.length;
        setTotalCount(totalItems);

        // Calculate total pages
        const calculatedTotalPages = Math.ceil(totalItems / pageSize);
        setTotalPages(calculatedTotalPages || 1);
      } else {
        console.error("Invalid response format:", response);
        if (response && response.error) {
          toast.error(response.error);
        }
        setListings([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast.error("Failed to load listings");
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch categories and listings on component mount and when filters change
  useEffect(() => {
    fetchCategories();
    fetchListings();
  }, [
    page,
    pageSize,
    searchTerm,
    categoryFilter,
    subcategoryFilter,
    statusFilter,
    isFeaturedFilter,
    priceFilter,
  ]);

  // Effect to fetch subcategories when category changes
  useEffect(() => {
    fetchSubcategories();
  }, [categoryFilter]);

  const filteredListings = listings; // You can add client-side filters if needed

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Listing Management
          </h1>
          <button
            className="btn-primary flex items-center"
            onClick={openAddModal}
          >
            <RiAddLine className="mr-2" />
            Add New Listing
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search listings..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <div className="w-40">
              <div className="relative">
                <RiFilterLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  className="input pl-10 appearance-none"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="w-40">
              <div className="relative">
                <RiFilterLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  className="input pl-10 appearance-none"
                  value={subcategoryFilter}
                  onChange={(e) => setSubcategoryFilter(e.target.value)}
                  disabled={!categoryFilter || categoryFilter === "all"}
                >
                  <option value="all">All Subcategories</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="w-40">
              <div className="relative">
                <RiFilterLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  className="input pl-10 appearance-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Listings */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.length > 0 ? (
              listings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48 bg-gray-200">
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={getImageUrl(listing.images[0])}
                        alt={listing.title}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src = PLACEHOLDER_IMAGE;
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                        <span>No Image</span>
                      </div>
                    )}
                    {listing.is_featured && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                        Featured
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-800 truncate">
                        {listing.title}
                      </h3>
                      <span className="text-primary-600 font-bold">
                        {formatPrice(listing.price)}/
                        {listing.price_period || "day"}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <span className="truncate">{listing.location}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span className="mr-2 px-2 py-1 bg-gray-100 rounded text-xs">
                        {listing.category?.name || "Uncategorized"}
                      </span>
                      {listing.condition && (
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {listing.condition}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {listing.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        Added {formatDate(listing.created_at)}
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => openViewModal(listing)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="View details"
                        >
                          <RiEyeLine size={18} />
                        </button>

                        <button
                          onClick={() => openEditModal(listing)}
                          className="p-1 text-yellow-600 hover:text-yellow-800 transition-colors"
                          title="Edit listing"
                        >
                          <RiEdit2Line size={18} />
                        </button>

                        <button
                          onClick={() => handleDelete(listing.id)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                          title="Delete listing"
                        >
                          <RiDeleteBinLine size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-8 text-center">
                <p className="text-gray-500 mb-4">No listings found</p>
                {!loading && (
                  <button
                    onClick={openAddModal}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <RiAddLine className="mr-2" />
                    Add New Listing
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Listing Modal */}
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
                <form onSubmit={handleSubmit}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {modalMode === "add"
                          ? "Add New Listing"
                          : "Edit Listing"}
                      </h3>
                    </div>

                    <div className="mb-4">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="title"
                      >
                        Title
                      </label>
                      <input
                        id="title"
                        name="title"
                        type="text"
                        className="input w-full"
                        value={formData.title}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="description"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        className="input w-full h-24"
                        value={formData.description}
                        onChange={handleChange}
                      ></textarea>
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Images (Maximum 5)
                      </label>
                      <div className="flex flex-col space-y-4">
                        {formData.images && formData.images.length > 0 ? (
                          <div className="grid grid-cols-5 gap-4 mb-2">
                            {formData.images.map((image, index) => (
                              <div key={index} className="relative group">
                                <div className="h-24 w-full overflow-hidden rounded-md border border-gray-300 shadow-sm">
                                  <img
                                    src={getImageUrl(image)}
                                    alt={`Listing image ${index + 1}`}
                                    onError={(e) => {
                                      e.target.src = PLACEHOLDER_IMAGE;
                                    }}
                                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                                  />
                                </div>
                                <div className="absolute top-0 right-0 p-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newImages = [...formData.images];
                                      newImages.splice(index, 1);
                                      setFormData({
                                        ...formData,
                                        images: newImages,
                                      });
                                    }}
                                    className="bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                  >
                                    <RiCloseLine className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs py-1 px-2 text-center">
                                  Image {index + 1}
                                </div>
                              </div>
                            ))}

                            {/* Empty placeholder slots */}
                            {Array.from({
                              length: 5 - (formData.images?.length || 0),
                            }).map((_, index) => (
                              <div
                                key={`empty-${index}`}
                                className="h-24 w-full rounded-md border border-dashed border-gray-300 flex items-center justify-center bg-gray-50"
                              >
                                <span className="text-gray-400 text-xs">
                                  Empty
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-5 gap-4 mb-2">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <div
                                key={`empty-${index}`}
                                className="h-24 w-full rounded-md border border-dashed border-gray-300 flex items-center justify-center bg-gray-50"
                              >
                                <span className="text-gray-400 text-xs">
                                  Empty
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
                            disabled={
                              formData.images && formData.images.length >= 5
                            }
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          {formData.images
                            ? `${formData.images.length}/5 images added`
                            : "0/5 images added"}
                          <br />
                          Images will be automatically resized to 800x600px. Max
                          file size: 5MB each.
                        </p>

                        {/* Display uploaded images */}
                        {formData.images && formData.images.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                            {formData.images.map((img, idx) => (
                              <div
                                key={idx}
                                className="relative group rounded-lg overflow-hidden border border-gray-200"
                              >
                                <img
                                  src={img}
                                  alt={`Listing ${idx + 1}`}
                                  className="h-28 w-full object-contain"
                                />
                                <button
                                  type="button"
                                  className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-red-500 hover:bg-red-100"
                                  onClick={() => removeImage(idx)}
                                  title="Remove"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label
                          className="block text-gray-700 text-sm font-bold mb-2"
                          htmlFor="price"
                        >
                          Price
                        </label>
                        <input
                          id="price"
                          name="price"
                          type="number"
                          min="0"
                          step="0.01"
                          className="input w-full"
                          value={formData.price}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div>
                        <label
                          className="block text-gray-700 text-sm font-bold mb-2"
                          htmlFor="location"
                        >
                          Location
                        </label>
                        <input
                          id="location"
                          name="location"
                          type="text"
                          className="input w-full"
                          value={formData.location}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label
                          className="block text-gray-700 text-sm font-bold mb-2"
                          htmlFor="category_id"
                        >
                          Category
                        </label>
                        <select
                          id="category_id"
                          name="category_id"
                          className="input w-full"
                          value={formData.category_id}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          className="block text-gray-700 text-sm font-bold mb-2"
                          htmlFor="subcategory_id"
                        >
                          Subcategory
                        </label>
                        <select
                          id="subcategory_id"
                          name="subcategory_id"
                          className="input w-full"
                          value={formData.subcategory_id}
                          onChange={handleChange}
                          disabled={
                            !formData.category_id || subcategories.length === 0
                          }
                        >
                          <option value="">Select a subcategory</option>
                          {subcategories.map((subcategory) => (
                            <option key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label
                          className="block text-gray-700 text-sm font-bold mb-2"
                          htmlFor="status"
                        >
                          Status
                        </label>
                        <select
                          id="status"
                          name="status"
                          className="input w-full"
                          value={formData.status}
                          onChange={handleChange}
                        >
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      <div className="flex items-center pt-6">
                        <input
                          id="is_featured"
                          name="is_featured"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          checked={formData.is_featured}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              is_featured: e.target.checked,
                            })
                          }
                        />
                        <label
                          htmlFor="is_featured"
                          className="ml-2 block text-sm text-gray-900"
                        >
                          Featured Listing
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {modalMode === "add" ? "Create" : "Update"}
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Listing Modal */}
        {showViewModal && viewListing && (
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
                  <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      Listing Details
                    </h3>
                    <button
                      onClick={closeViewModal}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      <RiCloseLine className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="mb-4 overflow-y-auto max-h-[70vh]">
                    <div className="font-bold text-xl mb-1">
                      {viewListing.title}
                    </div>
                    <div className="text-gray-600 mb-2">
                      {viewListing.description}
                    </div>

                    {/* Basic Info Section */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Basic Information
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">
                            Category:
                          </span>{" "}
                          {viewListing.category?.name || viewListing.category}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">
                            Subcategory:
                          </span>{" "}
                          {viewListing.subcategory?.name ||
                            viewListing.subcategory}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">
                            Brand:
                          </span>{" "}
                          {viewListing.brand || "N/A"}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">
                            Condition:
                          </span>{" "}
                          {viewListing.condition || "N/A"}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">
                            Status:
                          </span>{" "}
                          {viewListing.status}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">
                            Featured:
                          </span>{" "}
                          {viewListing.is_featured ? "Yes" : "No"}
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Availability Section */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Pricing & Availability
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">
                            Price:
                          </span>{" "}
                          <span className="font-semibold text-primary-700">
                            ${viewListing.price}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">
                            Period:
                          </span>{" "}
                          {viewListing.price_period || "Per Day"}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">
                            Deposit:
                          </span>{" "}
                          ${viewListing.deposit || "0"}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">
                            Min Duration:
                          </span>{" "}
                          {viewListing.min_duration || "1"}{" "}
                          {viewListing.price_period || "day(s)"}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">
                            Available From:
                          </span>{" "}
                          {viewListing.available_from
                            ? new Date(
                                viewListing.available_from
                              ).toLocaleDateString()
                            : "N/A"}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">
                            Available To:
                          </span>{" "}
                          {viewListing.available_to
                            ? new Date(
                                viewListing.available_to
                              ).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </div>
                    </div>

                    {/* Location & Delivery Section */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Location & Delivery
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">
                            Location:
                          </span>{" "}
                          {viewListing.location}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">
                            Delivery:
                          </span>{" "}
                          {viewListing.delivery ? "Available" : "Not Available"}
                        </div>
                        {viewListing.delivery && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">
                              Shipping Fee:
                            </span>{" "}
                            ${viewListing.shipping || "0"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Specifications Section */}
                    {viewListing.specifications &&
                      viewListing.specifications.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-800 mb-2">
                            Specifications
                          </h4>
                          <div className="bg-gray-50 p-2 rounded">
                            {viewListing.specifications.map((spec, idx) => (
                              <div
                                key={idx}
                                className="text-sm flex justify-between py-1 border-b border-gray-100 last:border-0"
                              >
                                <span className="font-medium text-gray-700">
                                  {spec.key}:
                                </span>
                                <span className="text-gray-600">
                                  {spec.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Terms & Policies Section */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Terms & Policies
                      </h4>
                      <div className="bg-gray-50 p-2 rounded">
                        {viewListing.rental_terms && (
                          <div className="text-sm mb-2">
                            <span className="font-medium text-gray-700 block mb-1">
                              Rental Terms:
                            </span>
                            <p className="text-gray-600">
                              {viewListing.rental_terms}
                            </p>
                          </div>
                        )}
                        {viewListing.cancellation && (
                          <div className="text-sm mb-2">
                            <span className="font-medium text-gray-700 block mb-1">
                              Cancellation Policy:
                            </span>
                            <p className="text-gray-600">
                              {viewListing.cancellation === "flexible" &&
                                "Flexible - Full refund 1 day prior"}
                              {viewListing.cancellation === "moderate" &&
                                "Moderate - Full refund 3 days prior"}
                              {viewListing.cancellation === "strict" &&
                                "Strict - 50% refund up to 1 week"}
                              {viewListing.cancellation === "non_refundable" &&
                                "Non-refundable"}
                            </p>
                          </div>
                        )}
                        {viewListing.notes && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-700 block mb-1">
                              Additional Notes:
                            </span>
                            <p className="text-gray-600">{viewListing.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Media Section */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Images
                      </h4>
                      {viewListing.images && viewListing.images.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {viewListing.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={getImageUrl(img)}
                              alt={`Listing image ${idx + 1}`}
                              onError={(e) => {
                                e.target.src = PLACEHOLDER_IMAGE;
                              }}
                              className="rounded shadow border object-contain w-full h-32"
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          No images available
                        </p>
                      )}
                    </div>

                    {viewListing.video && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">
                          Video
                        </h4>
                        <div className="text-sm">
                          <a
                            href={viewListing.video}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline"
                          >
                            Watch Video
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="mt-4 text-xs text-gray-500">
                      <div>
                        Created:{" "}
                        {new Date(viewListing.created_at).toLocaleString()}
                      </div>
                      <div>
                        Last Updated:{" "}
                        {new Date(viewListing.updated_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Listings;
