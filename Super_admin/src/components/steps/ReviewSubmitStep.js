import React from "react";

const ReviewSubmitStep = ({ formData, goToStep, onSubmit, isSubmitting }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-blue-700 mb-2 flex items-center gap-2">
      Review & Submit{" "}
      <span className="text-blue-400" title="Final check">
        ✅
      </span>
    </h2>
    <p className="text-gray-600 mb-4">
      Please review all information before submitting your listing. Click any
      section to edit.
    </p>
    <div
      className="bg-blue-50 rounded-lg p-4 mb-4 cursor-pointer hover:shadow"
      onClick={() => goToStep(0)}
    >
      <h3 className="text-blue-800 font-semibold mb-1">Basic Info</h3>
      <div className="text-sm text-gray-700">
        {formData.title} | {formData.category}{" "}
        {formData.subcategory && `> ${formData.subcategory}`}
      </div>
      <div className="text-sm text-gray-700">
        Brand: {formData.brand || "N/A"} | Condition: {formData.condition}
      </div>
      <div className="text-sm text-gray-700">
        Status: {formData.status} | Featured:{" "}
        {formData.isFeatured ? "Yes" : "No"}
      </div>
    </div>
    <div
      className="bg-blue-50 rounded-lg p-4 mb-4 cursor-pointer hover:shadow"
      onClick={() => goToStep(1)}
    >
      <h3 className="text-blue-800 font-semibold mb-1">Product Details</h3>
      <div className="text-sm text-gray-700">{formData.description}</div>
      <div className="text-sm text-gray-700">
        Specs:{" "}
        {formData.specifications.filter((s) => s.key).length > 0
          ? formData.specifications
              .filter((s) => s.key)
              .map((s) => `${s.key}: ${s.value}`)
              .join(", ")
          : "None"}
      </div>
      <div className="text-sm text-gray-700">
        ${formData.price} per {formData.pricePeriod} | Deposit: $
        {formData.deposit || "0"} | Min Duration: {formData.minDuration}
      </div>
    </div>
    <div
      className="bg-blue-50 rounded-lg p-4 mb-4 cursor-pointer hover:shadow"
      onClick={() => goToStep(2)}
    >
      <h3 className="text-blue-800 font-semibold mb-1">
        Availability & Location
      </h3>
      <div className="text-sm text-gray-700">
        {formData.availableFrom} to {formData.availableTo}
      </div>
      <div className="text-sm text-gray-700">Location: {formData.location}</div>
      <div className="text-sm text-gray-700">
        Delivery: {formData.delivery ? `Yes ($${formData.shipping})` : "No"}
      </div>
    </div>
    <div
      className="bg-blue-50 rounded-lg p-4 mb-4 cursor-pointer hover:shadow"
      onClick={() => goToStep(3)}
    >
      <h3 className="text-blue-800 font-semibold mb-1">Media</h3>
      <div className="flex gap-2 mt-2">
        {formData.images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt="preview"
            className="h-12 w-12 object-cover rounded"
          />
        ))}
      </div>
      <div className="text-sm text-gray-700 mt-1">
        Video: {formData.video || "N/A"}
      </div>
    </div>
    <div
      className="bg-blue-50 rounded-lg p-4 mb-4 cursor-pointer hover:shadow"
      onClick={() => goToStep(4)}
    >
      <h3 className="text-blue-800 font-semibold mb-1">Terms & Policies</h3>
      <div className="text-sm text-gray-700">{formData.rentalTerms}</div>
      <div className="text-sm text-gray-700">
        Deposit Accepted: {formData.acceptDeposit ? "Yes" : "No"}
      </div>
      <div className="text-sm text-gray-700">
        Cancellation: {formData.cancellation}
      </div>
      <div className="text-sm text-gray-700">
        Notes: {formData.notes || "None"}
      </div>
    </div>
    <div className="flex justify-center mt-8">
      <button
        className="px-8 py-3 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition disabled:opacity-50"
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Listing"}
      </button>
    </div>
  </div>
);

export default ReviewSubmitStep;
