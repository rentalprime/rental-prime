const express = require("express");
const router = express.Router();
const { protect, authorizeAdmin } = require("../middlewares/auth");

// Mock controller functions
const getPayments = (req, res) => {
  res.status(200).json({
    success: true,
    data: [
      {
        _id: "1",
        transactionId: "TRX-12345",
        user: "John Doe",
        email: "john@example.com",
        amount: 29.99,
        plan: "Premium Monthly",
        status: "completed",
        paymentMethod: "Credit Card",
        date: "2023-05-15T10:30:00Z",
      },
      {
        _id: "2",
        transactionId: "TRX-12346",
        user: "Jane Smith",
        email: "jane@example.com",
        amount: 299.99,
        plan: "Premium Yearly",
        status: "completed",
        paymentMethod: "PayPal",
        date: "2023-05-14T14:45:00Z",
      },
      {
        _id: "3",
        transactionId: "TRX-12347",
        user: "Robert Johnson",
        email: "robert@example.com",
        amount: 29.99,
        plan: "Premium Monthly",
        status: "failed",
        paymentMethod: "Credit Card",
        date: "2023-05-13T09:15:00Z",
      },
    ],
  });
};

const getPayment = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      _id: req.params.id,
      transactionId: "TRX-12345",
      user: "John Doe",
      email: "john@example.com",
      amount: 29.99,
      plan: "Premium Monthly",
      status: "completed",
      paymentMethod: "Credit Card",
      date: "2023-05-15T10:30:00Z",
    },
  });
};

// Routes
router.route("/").get(protect, authorizeAdmin, getPayments);

router.route("/:id").get(protect, authorizeAdmin, getPayment);

module.exports = router;
