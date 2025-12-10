const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const menuRoutes = require("./routes/menuRoutes");
const additiveRoutes = require("./routes/additiveRoutes");
const drinkRoutes = require("./routes/drinkRoutes");
const meatRoutes = require("./routes/meatRoutes");
const packageRoutes = require("./routes/packageOptionRoutes");
const stewRoutes = require("./routes/stewRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const walletRoutes = require("./routes/walletRoutes");
const vendorWalletRoutes = require("./routes/vendorWalletRoutes");
const mealPlanRoutes = require("./routes/mealPlanRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const authMiddleware = require("./middleware/authMiddleware"); // Changed import
const adminMiddleware = require("./middleware/adminMiddleware");

const adminRoutes = require("./routes/adminRoutes");

require("./jobs/dailyPayouts");
const { configureCloudinary, cloudinary } = require("./utils/cloudinary");
const {
  handlePayment,
  handleVerifyTransaction,
} = require("./controllers/paystack.js");

dotenv.config();

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const PAY_STACK_SECRET_KEY = process.env.PAY_STACK_SECRET_KEY;

// Configure Cloudinary
configureCloudinary(
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET
);

const app = express();
const PORT = process.env.PORT || 3100;

// Middleware
app.use(bodyParser.json());

// Database connection
mongoose
  .connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Basic route
app.get("/", (req, res) => {
  res.send("Backend Server is running!");
});

const cors = require("cors");
app.use(cors("*"));
app.use(
  cors({
    origin: process.env.ADMIN_FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.use("/api/vendors", vendorRoutes);
app.use("/api/meal-plans", mealPlanRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/additive", additiveRoutes);
app.use("/api/drink", drinkRoutes);
app.use("/api/meat", meatRoutes);
app.use("/api/package", packageRoutes);
app.use("/api/stew", stewRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/vendorwallet", vendorWalletRoutes);
app.use("/api/favorites", favoriteRoutes);

// Updated admin routes middleware
app.use(
  "/api/admin",
  authMiddleware.authMiddleware, // Access the authMiddleware property
  adminMiddleware.requireAdmin, // Access the requireAdmin property
  adminRoutes
);

app.use("/api", userRoutes);

// Paystack routes
app.post("/api/paystack/create", handlePayment(PAY_STACK_SECRET_KEY));
app.get("/api/paystack/verify", handleVerifyTransaction(PAY_STACK_SECRET_KEY));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
