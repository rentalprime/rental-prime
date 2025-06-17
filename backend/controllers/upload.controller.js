const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// @desc    Upload listing images
// @route   POST /api/upload/listing-images
// @access  Private
exports.uploadListingImages = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files were uploaded",
      });
    }

    // Handle multiple files
    const images = Array.isArray(req.files.images)
      ? req.files.images
      : [req.files.images];
    const imageUrls = [];

    // Process each image
    for (const image of images) {
      // Create unique filename
      const uniqueFilename = `${uuidv4()}${path.extname(image.name)}`;
      const uploadPath = path.join(
        __dirname,
        "../public/uploads/listings",
        uniqueFilename
      );

      // Ensure directory exists
      const dir = path.dirname(uploadPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Move the file
      await image.mv(uploadPath);

      // Generate URL for the image
      const imageUrl = `/uploads/listings/${uniqueFilename}`;
      imageUrls.push(imageUrl);
    }

    res.status(200).json({
      success: true,
      data: imageUrls,
    });
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading images",
      error: error.message,
    });
  }
};

// @desc    Upload to Local Storage (Alternative method)
// @route   POST /api/upload/local
// @access  Private
exports.uploadToLocal = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files were uploaded",
      });
    }

    // Handle multiple files
    const images = Array.isArray(req.files.images)
      ? req.files.images
      : [req.files.images];
    const imageUrls = [];

    // Ensure upload directory exists
    const uploadDir = path.join(__dirname, "../public/uploads/listings");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Process each image
    for (const image of images) {
      const uniqueFilename = `${uuidv4()}${path.extname(image.name)}`;
      const uploadPath = path.join(uploadDir, uniqueFilename);

      // Save file to local storage
      await image.mv(uploadPath);

      // Create public URL
      const publicUrl = `/uploads/listings/${uniqueFilename}`;
      imageUrls.push(publicUrl);
    }

    res.status(200).json({
      success: true,
      data: imageUrls,
    });
  } catch (error) {
    console.error("Error uploading to local storage:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading to local storage",
      error: error.message,
    });
  }
};
