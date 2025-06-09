const express = require("express");
const router = express.Router();
const {
  protect,
  authorizeAdmin,
  authorizeSuperAdmin,
} = require("../middlewares/auth");

// Mock controller functions
const getSettings = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      general: {
        siteName: "Rental Prima",
        siteDescription: "Find your perfect rental property",
        logo: "logo.png",
        favicon: "favicon.ico",
        contactEmail: "contact@rentalprimaexample.com",
        contactPhone: "+1 (555) 123-4567",
        address: "123 Main St, New York, NY 10001",
        socialLinks: {
          facebook: "https://facebook.com/rentalprimaexample",
          twitter: "https://twitter.com/rentalprimaexample",
          instagram: "https://instagram.com/rentalprimaexample",
        },
      },
      email: {
        smtpHost: "smtp.example.com",
        smtpPort: 587,
        smtpUser: "notifications@rentalprimaexample.com",
        smtpPassword: "********",
        fromEmail: "notifications@rentalprimaexample.com",
        fromName: "Rental Prima",
        emailNotifications: true,
      },
      security: {
        twoFactorAuth: false,
        loginAttempts: 5,
        lockoutTime: 30,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSymbols: false,
        },
      },
    },
  });
};

const updateSettings = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      ...req.body,
    },
  });
};

// Routes
router
  .route("/")
  .get(protect, authorizeAdmin, getSettings) // Admin can read settings
  .put(protect, authorizeSuperAdmin, updateSettings); // Only super admin can update settings

module.exports = router;
