const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

const router = express.Router();

// Local auth routes
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

// Google auth
router.post("/google-login", userController.googleLogin);

// Profile & password management
router.get("/me", authMiddleware, userController.getUserProfile);
router.put("/profile", authMiddleware, userController.updateProfile);
router.put("/change-password", authMiddleware, userController.changePassword);

// Password recovery
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

// Addresses
router.post("/address", authMiddleware, userController.addAddress);
router.put("/address/:addressId", authMiddleware, userController.updateAddress);
router.delete(
  "/address/:addressId",
  authMiddleware,
  userController.deleteAddress
);

// User retrieval
router.get("/:id", userController.getUser);
router.get("/", userController.getAllUsers);

module.exports = router;
