const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const userService = require("../services/userService");

const googleClient = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

// Helper to generate JWT
const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

/**
 * Google login / signup
 */
const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken)
      return res.status(400).json({ message: "idToken is required" });

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_WEB_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture, sub } = payload;

    const { user } = await userService.googleLogin({
      email,
      firstName: given_name,
      lastName: family_name,
      googleId: sub,
      profileImage: picture,
    });

    const token = generateToken(user._id);

    res.json({ message: "Google login successful", user, token });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(400).json({ message: "Invalid Google token" });
  }
};

/**
 * Local registration
 */
const registerUser = async (req, res) => {
  try {
    const user = await userService.registerUser(req.body);
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Local login
 */
const loginUser = async (req, res) => {
  try {
    const { user, token } = await userService.loginUser(
      req.body.email,
      req.body.password
    );
    res.json({ message: "Login successful", user, token });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// Password & profile management
const forgotPassword = async (req, res) => {
  try {
    await userService.forgotPassword(req.body.email);
    res.json({
      message:
        "If the email exists, a reset code has been sent. Please check your inbox.",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const message = await userService.resetPassword(
      req.body.token,
      req.body.newPassword
    );
    res.json({ message });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await userService.updateProfile(req.user.userId, req.body);
    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const user = await userService.changePassword(
      req.user.userId,
      req.body.oldPassword,
      req.body.newPassword
    );
    res.json({ message: "Password changed successfully", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// User retrieval
const getUserProfile = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    res.json({ message: "User retrieved successfully", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json({ message: "User retrieved successfully", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json({ message: "Users retrieved successfully", users });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Address management
const addAddress = async (req, res) => {
  try {
    const addresses = await userService.addAddress(req.user.userId, req.body);
    res.json({ success: true, addresses });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    const addresses = await userService.updateAddress(
      req.user.userId,
      req.params.addressId,
      req.body
    );
    res.json({ success: true, addresses });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const addresses = await userService.deleteAddress(
      req.user.userId,
      req.params.addressId
    );
    res.json({ success: true, addresses });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  getUserProfile,
  getUser,
  getAllUsers,
  addAddress,
  updateAddress,
  deleteAddress,
};
