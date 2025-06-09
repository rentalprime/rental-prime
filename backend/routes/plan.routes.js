const express = require("express");
const router = express.Router();
const { protect, authorizeSuperAdmin } = require("../middlewares/auth");

// Mock controller functions
const getPlans = (req, res) => {
  res.status(200).json({
    success: true,
    data: [
      {
        _id: "1",
        name: "Basic",
        description: "Perfect for individuals and small businesses",
        price: 19.99,
        interval: "monthly",
        features: [
          "Up to 5 listings",
          "Basic analytics",
          "Email support",
          "1 user account",
        ],
        status: "active",
        subscribers: 245,
        createdAt: "2023-01-15T10:30:00Z",
      },
      {
        _id: "2",
        name: "Premium",
        description: "Ideal for growing businesses",
        price: 29.99,
        interval: "monthly",
        features: [
          "Up to 20 listings",
          "Advanced analytics",
          "Priority email support",
          "3 user accounts",
          "Featured listings",
        ],
        status: "active",
        subscribers: 178,
        createdAt: "2023-01-20T14:45:00Z",
      },
      {
        _id: "3",
        name: "Enterprise",
        description: "For large businesses with custom needs",
        price: 99.99,
        interval: "monthly",
        features: [
          "Unlimited listings",
          "Custom analytics dashboard",
          "24/7 phone support",
          "Unlimited user accounts",
          "Featured listings",
          "API access",
        ],
        status: "active",
        subscribers: 32,
        createdAt: "2023-03-12T11:10:00Z",
      },
    ],
  });
};

const getPlan = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      _id: req.params.id,
      name: "Premium",
      description: "Ideal for growing businesses",
      price: 29.99,
      interval: "monthly",
      features: [
        "Up to 20 listings",
        "Advanced analytics",
        "Priority email support",
        "3 user accounts",
        "Featured listings",
      ],
      status: "active",
      subscribers: 178,
      createdAt: "2023-01-20T14:45:00Z",
    },
  });
};

const createPlan = (req, res) => {
  res.status(201).json({
    success: true,
    data: {
      _id: Date.now().toString(),
      ...req.body,
      subscribers: 0,
      createdAt: new Date().toISOString(),
    },
  });
};

const updatePlan = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      _id: req.params.id,
      ...req.body,
      subscribers: 178,
      createdAt: "2023-01-20T14:45:00Z",
    },
  });
};

const deletePlan = (req, res) => {
  res.status(200).json({
    success: true,
    data: {},
  });
};

// Routes
router
  .route("/")
  .get(getPlans) // Public access for reading plans
  .post(protect, authorizeSuperAdmin, createPlan); // Super admin only

router
  .route("/:id")
  .get(getPlan) // Public access for reading single plan
  .put(protect, authorizeSuperAdmin, updatePlan) // Super admin only
  .delete(protect, authorizeSuperAdmin, deletePlan); // Super admin only

module.exports = router;
