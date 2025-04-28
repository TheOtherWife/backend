const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

const router = express.Router();

// User registration route
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/me", authMiddleware, userController.getUserProfile);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.put("/profile", authMiddleware, userController.updateProfile);
router.put("/change-password", authMiddleware, userController.changePassword);
router.post("/address", authMiddleware, userController.addAddress);
router.put("/address/:id", authMiddleware, userController.updateAddress);
router.delete("/address/:id", authMiddleware, userController.deleteAddress);
router.get("/:id", userController.getUser);
router.get("/", userController.getAllUsers);

module.exports = router;
