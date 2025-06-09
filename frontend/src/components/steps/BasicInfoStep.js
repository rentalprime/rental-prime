import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import categoryService from "../../services/categoryService";

const conditions = ["New", "Like New", "Good", "Used", "Needs Repair"];

const BasicInfoStep = ({ formData, onChange }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const categoryData =
          await categoryService.getCategoryHierarchyForDropdown();
        setCategories(categoryData);
        console.log("Categories loaded for BasicInfoStep:", categoryData);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
        toast.error("Failed to load categories. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const selectedCat = categories.find((c) => c.value === formData.category);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-blue-700 mb-2 flex items-center gap-2">
        Basic Product Information
        <span className="text-blue-400" title="Start here!">
          ℹ️
        </span>
      </h2>
      <div>
        <label className="block text-sm font-medium text-blue-900 mb-1">
          Product Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          value={formData.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="e.g. Canon DSLR Camera"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-blue-900 mb-1">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          value={formData.category}
          onChange={(e) => {
            onChange("category", e.target.value);
            // Clear subcategory when category changes
            if (formData.subcategory) {
              onChange("subcategory", "");
            }
          }}
          disabled={loading}
        >
          <option value="">
            {loading ? "Loading categories..." : "Select category"}
          </option>
          {!loading &&
            !error &&
            categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
        </select>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
      {formData.category &&
        selectedCat &&
        selectedCat.subcategories &&
        selectedCat.subcategories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              Subcategory <span className="text-gray-400">(optional)</span>
            </label>
            <select
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={formData.subcategory}
              onChange={(e) => onChange("subcategory", e.target.value)}
            >
              <option value="">Select subcategory</option>
              {selectedCat.subcategories.map((sc) => (
                <option key={sc.value} value={sc.value}>
                  {sc.label}
                </option>
              ))}
            </select>
          </div>
        )}
      <div>
        <label className="block text-sm font-medium text-blue-900 mb-1">
          Brand
        </label>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          value={formData.brand}
          onChange={(e) => onChange("brand", e.target.value)}
          placeholder="e.g. Samsung, IKEA"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-blue-900 mb-1">
          Condition <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-4 mt-1">
          {conditions.map((cond) => (
            <label
              key={cond}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="condition"
                checked={formData.condition === cond}
                onChange={() => onChange("condition", cond)}
                className="accent-blue-600"
              />
              <span>{cond}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-blue-900 mb-1">
          Status
        </label>
        <select
          className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          value={formData.status}
          onChange={(e) => onChange("status", e.target.value)}
        >
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
        <span className="text-gray-400 text-xs">
          Active listings are visible to customers
        </span>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <input
          type="checkbox"
          checked={formData.isFeatured}
          onChange={(e) => onChange("isFeatured", e.target.checked)}
          className="accent-blue-600"
          id="isFeatured"
        />
        <label
          htmlFor="isFeatured"
          className="text-sm font-medium text-blue-900"
        >
          Featured Listing
        </label>
        <span className="text-gray-400 text-xs ml-1">
          (Highlight this listing)
        </span>
      </div>
    </div>
  );
};

export default BasicInfoStep;
