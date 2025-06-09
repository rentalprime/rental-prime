import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ProgressBar from "./ProgressBar";
import BasicInfoStep from "./steps/BasicInfoStep";
import ProductDetailsStep from "./steps/ProductDetailsStep";
import AvailabilityLocationStep from "./steps/AvailabilityLocationStep";
import MediaUploadStep from "./steps/MediaUploadStep";
import TermsPoliciesStep from "./steps/TermsPoliciesStep";
import ReviewSubmitStep from "./steps/ReviewSubmitStep";
import listingService from "../services/listingService";

const steps = [
  { label: "Basic Info", icon: "📦" },
  { label: "Details", icon: "📝" },
  { label: "Availability", icon: "📅" },
  { label: "Media", icon: "🖼️" },
  { label: "Terms", icon: "📃" },
  { label: "Review", icon: "✅" },
];

const initialFormData = {
  title: "",
  category: "",
  subcategory: "",
  brand: "",
  condition: "",
  description: "",
  specifications: [{ key: "", value: "" }],
  price: "",
  pricePeriod: "day",
  deposit: "",
  minDuration: 1,
  availableFrom: "",
  availableTo: "",
  location: "",
  delivery: false,
  shipping: "",
  images: [],
  video: "",
  rentalTerms: "",
  acceptDeposit: false,
  cancellation: "flexible",
  notes: "",
  isFeatured: false,
  status: "active",
};

const MultiStepForm = ({ isEditMode = false, listingId = null }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [originalListing, setOriginalListing] = useState(null);

  const nextStep = () => {
    const isValid = validateStep(currentStep);
    console.log(`Step ${currentStep} validation:`, isValid);
    console.log("Current form data:", formData);

    if (isValid) {
      setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
    } else {
      alert("Please fill all required fields");
    }
  };

  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));
  const goToStep = (idx) => {
    if (idx <= currentStep) {
      setCurrentStep(idx);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Function to transform API listing data to form format
  const transformListingToFormData = (listing) => {
    // Parse JSON fields if they're strings
    let images = [];
    let specifications = [{ key: "", value: "" }];

    if (listing.images) {
      if (typeof listing.images === "string") {
        try {
          images = JSON.parse(listing.images);
        } catch (e) {
          console.error("Error parsing images:", e);
          images = [];
        }
      } else if (Array.isArray(listing.images)) {
        images = listing.images;
      }
    }

    if (listing.specifications) {
      if (typeof listing.specifications === "string") {
        try {
          const parsedSpecs = JSON.parse(listing.specifications);
          specifications =
            Array.isArray(parsedSpecs) && parsedSpecs.length > 0
              ? parsedSpecs
              : [{ key: "", value: "" }];
        } catch (e) {
          console.error("Error parsing specifications:", e);
          specifications = [{ key: "", value: "" }];
        }
      } else if (Array.isArray(listing.specifications)) {
        specifications =
          listing.specifications.length > 0
            ? listing.specifications
            : [{ key: "", value: "" }];
      }
    }

    return {
      title: listing.title || "",
      category: listing.category_id || "",
      subcategory: listing.subcategory_id || "",
      brand: listing.brand || "",
      condition: listing.condition || "",
      description: listing.description || "",
      specifications: specifications,
      price: listing.price ? listing.price.toString() : "",
      pricePeriod: listing.price_period || "day",
      deposit: listing.deposit ? listing.deposit.toString() : "",
      minDuration: listing.min_duration || 1,
      availableFrom: listing.available_from
        ? listing.available_from.split("T")[0]
        : "",
      availableTo: listing.available_to
        ? listing.available_to.split("T")[0]
        : "",
      location: listing.location || "",
      delivery: Boolean(listing.delivery),
      shipping: listing.shipping ? listing.shipping.toString() : "",
      images: images,
      video: listing.video || "",
      rentalTerms: listing.rental_terms || "",
      acceptDeposit: Boolean(listing.accept_deposit),
      cancellation: listing.cancellation || "flexible",
      notes: listing.notes || "",
      isFeatured: Boolean(listing.is_featured),
      status: listing.status || "active",
    };
  };

  // Function to fetch listing data for edit mode
  const fetchListingData = async () => {
    if (!isEditMode || !listingId) return;

    try {
      setIsLoading(true);
      console.log("Fetching listing data for edit mode, ID:", listingId);

      const listing = await listingService.getListing(listingId);
      console.log("Fetched listing data:", listing);

      setOriginalListing(listing);
      const transformedData = transformListingToFormData(listing);
      console.log("Transformed form data:", transformedData);

      setFormData(transformedData);
    } catch (error) {
      console.error("Error fetching listing data:", error);
      toast.error("Failed to load listing data");
      // Navigate back to listings page on error
      navigate("/listings");
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to fetch listing data when in edit mode
  useEffect(() => {
    fetchListingData();
  }, [isEditMode, listingId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Validate required fields before submission
      if (
        !formData.title ||
        !formData.description ||
        !formData.price ||
        !formData.category ||
        !formData.location
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Map form data to backend expected format
      const listingData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: formData.category,
        location: formData.location,
        brand: formData.brand || "",
        condition: formData.condition,
        specifications: formData.specifications.filter(
          (spec) => spec.key.trim() && spec.value.trim()
        ),
        price_period: formData.pricePeriod,
        deposit: parseFloat(formData.deposit) || 0,
        min_duration: parseInt(formData.minDuration) || 1,
        available_from: formData.availableFrom || null,
        available_to: formData.availableTo || null,
        delivery: formData.delivery,
        shipping: parseFloat(formData.shipping) || 0,
        images: formData.images,
        video: formData.video || "",
        rental_terms: formData.rentalTerms,
        accept_deposit: formData.acceptDeposit,
        cancellation: formData.cancellation,
        notes: formData.notes || "",
        status: formData.status,
        is_featured: formData.isFeatured,
      };

      console.log("Submitting listing data:", listingData);
      console.log(
        "Auth token:",
        localStorage.getItem("token") ? "Present" : "Missing"
      );

      let result;
      if (isEditMode && listingId) {
        // Update existing listing
        result = await listingService.updateListing(listingId, listingData);
        if (result) {
          toast.success("Listing updated successfully!");
          console.log("Updated listing:", result);
          // Navigate back to listings page
          navigate("/listings");
        }
      } else {
        // Create new listing
        result = await listingService.createListing(listingData);
        if (result) {
          toast.success("Listing created successfully!");
          console.log("Created listing:", result);
          // Reset form
          setFormData(initialFormData);
          setCurrentStep(0);
          // Navigate back to listings page
          navigate("/listings");
        }
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} listing:`,
        error
      );
      toast.error(
        error.message || `Failed to ${isEditMode ? "update" : "create"} listing`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        // Only require title, category, and condition - subcategory and brand are optional
        return formData.title && formData.category && formData.condition;
      case 1:
        // Only require description and price - specifications are optional
        // If specifications are provided, they should be complete (both key and value)
        const validSpecs = formData.specifications.filter(
          (spec) => spec.key.trim() || spec.value.trim()
        );
        const allSpecsComplete = validSpecs.every(
          (spec) => spec.key.trim() && spec.value.trim()
        );
        return formData.description && formData.price && allSpecsComplete;
      case 2:
        // Location is required by backend, but availability dates are optional
        return formData.location;
      case 3:
        return formData.images.length > 0;
      case 4:
        return formData.rentalTerms;
      default:
        return true;
    }
  };

  // Show loading state while fetching data in edit mode
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg px-6 py-8 mt-6 mb-12">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading listing data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg px-6 py-8 mt-6 mb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? "Edit Listing" : "Create New Listing"}
        </h1>
        {isEditMode && originalListing && (
          <p className="text-gray-600 mt-1">Editing: {originalListing.title}</p>
        )}
      </div>
      <ProgressBar
        steps={steps}
        currentStep={currentStep}
        onStepClick={goToStep}
      />
      <div className="mt-8">
        {currentStep === 0 && (
          <BasicInfoStep formData={formData} onChange={handleChange} />
        )}
        {currentStep === 1 && (
          <ProductDetailsStep formData={formData} onChange={handleChange} />
        )}
        {currentStep === 2 && (
          <AvailabilityLocationStep
            formData={formData}
            onChange={handleChange}
          />
        )}
        {currentStep === 3 && (
          <MediaUploadStep formData={formData} onChange={handleChange} />
        )}
        {currentStep === 4 && (
          <TermsPoliciesStep formData={formData} onChange={handleChange} />
        )}
        {currentStep === 5 && (
          <ReviewSubmitStep
            formData={formData}
            goToStep={goToStep}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
      <div className="flex justify-between mt-10">
        <button
          className="px-6 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition disabled:opacity-50"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          Back
        </button>
        {currentStep < steps.length - 1 ? (
          <button
            className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            onClick={nextStep}
          >
            Next
          </button>
        ) : (
          <button
            className="px-6 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEditMode
                ? "Updating..."
                : "Submitting..."
              : isEditMode
              ? "Update Listing"
              : "Submit"}
          </button>
        )}
      </div>
    </div>
  );
};

export default MultiStepForm;
