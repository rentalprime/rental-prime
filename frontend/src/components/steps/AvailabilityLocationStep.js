import React from "react";

const AvailabilityLocationStep = ({ formData, onChange }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-blue-700 mb-2 flex items-center gap-2">
        Availability & Location{" "}
        <span className="text-blue-400" title="Set when and where">
          📅
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">
            Available From
          </label>
          <input
            type="date"
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={formData.availableFrom}
            onChange={(e) => onChange("availableFrom", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">
            Available To
          </label>
          <input
            type="date"
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={formData.availableTo}
            onChange={(e) => onChange("availableTo", e.target.value)}
            min={formData.availableFrom}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-blue-900 mb-1">
          Pickup Location <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          value={formData.location}
          onChange={(e) => onChange("location", e.target.value)}
          placeholder="Enter address or location"
        />
        {/* Map integration placeholder */}
        <div className="mt-2 w-full h-40 rounded-lg bg-blue-50 flex items-center justify-center text-blue-400 text-sm">
          <span>Map integration coming soon</span>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <input
          type="checkbox"
          checked={formData.delivery}
          onChange={(e) => onChange("delivery", e.target.checked)}
          className="accent-blue-600"
          id="delivery"
        />
        <label htmlFor="delivery" className="text-sm font-medium text-blue-900">
          Delivery Available?
        </label>
      </div>
      {formData.delivery && (
        <div className="mt-2">
          <label className="block text-sm font-medium text-blue-900 mb-1">
            Shipping Charges
          </label>
          <div className="flex items-center">
            <span className="text-gray-500 mr-1">$</span>
            <input
              type="number"
              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500"
              value={formData.shipping}
              onChange={(e) => onChange("shipping", e.target.value)}
              min={0}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityLocationStep;
