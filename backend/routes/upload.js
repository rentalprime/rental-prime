const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const { protect, authorize } = require('../middlewares/auth');
const { uploadListingImages, uploadToSupabase } = require('../controllers/upload.controller');

// Ensure uploads directory exists
const baseUploadDir = path.join(__dirname, '../../public/uploads/listings');
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const listingId = req.params.listingId || 'temp';
    const uploadPath = path.join(baseUploadDir, listingId);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const originalName = file.originalname;
    // Sanitize filename
    const sanitizedFilename = originalName.replace(/[^\w\d.-]/g, '_');
    cb(null, `${timestamp}-${sanitizedFilename}`);
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Configure multer to handle multiple files
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 5 // Maximum 5 files
  }
}).array('images', 5);

// Legacy upload endpoint
router.post('/:listingId', protect, (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ 
        success: false,
        message: err.message || 'Error uploading files',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: 'No files were uploaded'
        });
      }
      
      const uploadedFiles = req.files;
      const listingId = req.params.listingId;
      
      // Generate URLs for uploaded files
      const fileUrls = uploadedFiles.map(file => {
        return `/uploads/listings/${listingId}/${path.basename(file.path)}`;
      });

      res.json({ 
        success: true,
        urls: fileUrls 
      });
    } catch (error) {
      console.error('Error processing uploaded files:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to process uploaded files',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
});

// New upload endpoints using express-fileupload
router.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  createParentPath: true,
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Upload listing images to local storage
router.post('/listing-images', protect, uploadListingImages);

// Upload listing images to Supabase storage
router.post('/supabase', protect, uploadToSupabase);

module.exports = router;
