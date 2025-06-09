const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');

// @desc    Upload listing images
// @route   POST /api/upload/listing-images
// @access  Private
exports.uploadListingImages = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded'
      });
    }

    // Handle multiple files
    const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    const imageUrls = [];

    // Process each image
    for (const image of images) {
      // Create unique filename
      const uniqueFilename = `${uuidv4()}${path.extname(image.name)}`;
      const uploadPath = path.join(__dirname, '../public/uploads/listings', uniqueFilename);
      
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
      data: imageUrls
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message
    });
  }
};

// @desc    Upload to Supabase Storage
// @route   POST /api/upload/supabase
// @access  Private
exports.uploadToSupabase = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded'
      });
    }

    // Handle multiple files
    const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    const imageUrls = [];

    // Process each image
    for (const image of images) {
      const uniqueFilename = `${uuidv4()}${path.extname(image.name)}`;
      const filePath = `listings/${uniqueFilename}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('rental-prima')
        .upload(filePath, image.data, {
          contentType: image.mimetype,
          cacheControl: '3600'
        });

      if (error) {
        throw new Error(error.message);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('rental-prima')
        .getPublicUrl(filePath);

      imageUrls.push(urlData.publicUrl);
    }

    res.status(200).json({
      success: true,
      data: imageUrls
    });
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading to Supabase',
      error: error.message
    });
  }
};
