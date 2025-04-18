const express = require("express");
const userController = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// User registration route
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/me", authMiddleware, userController.getUserProfile);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.put("/profile", authMiddleware, userController.updateProfile);
router.put("/change-password", authMiddleware, userController.changePassword);
router.get("/:id", userController.getUser);
router.get("/", userController.getAllUsers);

module.exports = router;
