const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

const { createClient } = require("@supabase/supabase-js");

// Load environment variables
dotenv.config();
// const config = require("./config/config");
// console.log("Using Supabase Key:", config.supabaseKey);

// Initialize Supabase client
const supabaseUrl =
  process.env.SUPABASE_URL || "https://vmwjqwgvzmwjomcehabe.supabase.co";
// const supabaseAnonKey =
//   process.env.SUPABASE_ANON_KEY ||
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtd2pxd2d2em13am9tY2VoYWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4OTgyODYsImV4cCI6MjA2MzQ3NDI4Nn0.pxO8lrc8z6ByVJ-7bKny7LjRfmCHD4iMcbM1NbaMS8U";
const supabase_service_role =
  process.env.SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtd2pxd2d2em13am9tY2VoYWJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg5ODI4NiwiZXhwIjoyMDYzNDc0Mjg2fQ.H1YMO_Tye6ikWth7csEwPMWI3CxYcQaQ6N6oNXwf-0c";
const supabase = createClient(supabaseUrl, supabase_service_role);

// Make supabase available to route handlers
global.supabase = supabase;

// Import routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");
const categoryRoutes = require("./routes/category.routes");
const listingRoutes = require("./routes/listing.routes.new");
const adminListingRoutes = require("./routes/listing.routes");
const paymentRoutes = require("./routes/payment.routes");
const planRoutes = require("./routes/plan.routes");
const settingRoutes = require("./routes/setting.routes");
const notificationRoutes = require("./routes/notification.routes");
const supportRoutes = require("./routes/support.routes");
const roleRoutes = require("./routes/role.routes");
const uploadRoutes = require("./routes/upload");

// Initialize Express app
const app = express();

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:3000",
        // Add your frontend deployment URLs here
        // Example: "https://your-frontend-domain.com",
      ];

      // Check if the origin is allowed
      const allowed = allowedOrigins.some((allowedOrigin) => {
        if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return allowedOrigin === origin;
      });

      if (allowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    supabase: supabaseUrl ? "configured" : "not configured",
    version: "1.0.0",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin/listings", adminListingRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/upload", uploadRoutes);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/build", "index.html"));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Define PORT - use environment variable or default to 5001
const PORT = process.env.PORT || 5001;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Supabase client initialized with URL: ${supabaseUrl}`);
});

// Export the app for potential use as a module
module.exports = app;
