import React, { useRef } from "react";
import { toast } from "react-hot-toast";

const MediaUploadStep = ({ formData, onChange }) => {
  const fileInput = useRef();

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

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 10 - (formData.images?.length || 0);

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
      onChange("images", [...(formData.images || []), ...processedImages]);
      toast.success(
        `${processedImages.length} image(s) uploaded and resized successfully`
      );
    }
  };
  const removeImage = (idx) => {
    onChange(
      "images",
      formData.images.filter((_, i) => i !== idx)
    );
  };
  const moveImage = (from, to) => {
    if (to < 0 || to >= formData.images.length) return;
    const newArr = [...formData.images];
    const [moved] = newArr.splice(from, 1);
    newArr.splice(to, 0, moved);
    onChange("images", newArr);
  };
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-blue-700 mb-2 flex items-center gap-2">
        Upload Photos & Videos{" "}
        <span className="text-blue-400" title="Add visuals">
          🖼️
        </span>
      </h2>
      <div>
        <label className="block text-sm font-medium text-blue-900 mb-1">
          Product Images <span className="text-red-500">*</span>
        </label>
        <div
          className="border-2 border-dashed border-blue-200 rounded-lg p-6 text-center bg-blue-50 cursor-pointer hover:bg-blue-100 transition"
          onClick={() => fileInput.current.click()}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            ref={fileInput}
            onChange={handleFiles}
            disabled={formData.images && formData.images.length >= 10}
          />
          <div className="text-blue-400 text-3xl mb-2">📤</div>
          <div className="text-gray-500">
            {formData.images && formData.images.length >= 10
              ? "Maximum 10 images reached"
              : "Drag & drop or click to upload images (max 10)"}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Images will be automatically resized to 800x600px. Max file size:
            5MB each.
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
          {formData.images.map((img, idx) => (
            <div
              key={idx}
              className="relative group rounded-lg overflow-hidden border border-gray-200"
            >
              <img
                src={img}
                alt={`Product ${idx + 1}`}
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
              <div className="absolute bottom-1 left-1 flex gap-1">
                <button
                  type="button"
                  className="text-xs bg-white bg-opacity-70 rounded px-1"
                  onClick={() => moveImage(idx, idx - 1)}
                  title="Move Left"
                >
                  ◀️
                </button>
                <button
                  type="button"
                  className="text-xs bg-white bg-opacity-70 rounded px-1"
                  onClick={() => moveImage(idx, idx + 1)}
                  title="Move Right"
                >
                  ▶️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <label className="block text-sm font-medium text-blue-900 mb-1">
          Video URL <span className="text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          value={formData.video}
          onChange={(e) => onChange("video", e.target.value)}
          placeholder="e.g. https://www.youtube.com/watch?v=..."
        />
      </div>
    </div>
  );
};

export default MediaUploadStep;
