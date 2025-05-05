const userService = require("../services/userService");

const registerUser = async (req, res) => {
  try {
    const userData = req.body;

    // Log the incoming request payload for debugging

    // Validate the request body
    if (!userData) {
      return res.status(400).json({ message: "Request body is required" });
    }

    // Call the service to register the user
    const user = await userService.registerUser(userData);

    // Exclude password from the response
    const userResponse = { ...user };
    delete userResponse.password;

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error in registerUser controller:", error.message);

    res.status(400).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Call the service to log in the user
    const { user, token } = await userService.loginUser(email, password);

    // Exclude password from the response
    const userResponse = { ...user }; // Ensure this line is present
    delete userResponse.password;

    res.status(200).json({
      message: "Login successful",
      user: userResponse,
      token,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error during login:", error.message);

    res.status(400).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const resetToken = await userService.forgotPassword(email);

    res.status(200).json({
      message: "Password reset token sent",
      resetToken, // In production, send this via email
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    console.log("Reset password request:", { token, newPassword }); // Log the request payload

    // Call the service to reset the password
    const message = await userService.resetPassword(token, newPassword);

    res.status(200).json({
      message,
    });
  } catch (error) {
    console.error("Error in resetPassword controller:", error.message); // Log the error
    res.status(400).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Assuming userId is extracted from JWT
    const updateData = req.body;
    const user = await userService.updateProfile(userId, updateData);

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId; // Assuming userId is extracted from JWT
    const { oldPassword, newPassword } = req.body;
    const user = await userService.changePassword(
      userId,
      oldPassword,
      newPassword
    );

    res.status(200).json({
      message: "Password changed successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await userService.getUserById(userId);

    res.status(200).json({
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userService.getUserById(userId);

    res.status(200).json({
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();

    res.status(200).json({
      message: "Users retrieved successfully",
      users,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const addAddress = async (req, res) => {
  try {
    const { userId } = req.user;
    if (!userId) {
      throw new Error("User ID is missing in the request.");
    }

    const updatedAddresses = await userService.addAddress(userId, req.body);
    res.json({ success: true, addresses: updatedAddresses });
  } catch (err) {
    console.error("Error adding address:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { userId } = req.user;
    const { addressId } = req.params;
    const updatedAddresses = await userService.updateAddress(
      userId,
      addressId,
      req.body
    );
    res.json({ success: true, addresses: updatedAddresses });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { userId } = req.user;
    const { addressId } = req.params;
    const updatedAddresses = await userService.deleteAddress(userId, addressId);
    res.json({ success: true, addresses: updatedAddresses });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  getUser,
  getAllUsers,
  getUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
};
