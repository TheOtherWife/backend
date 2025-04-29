const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const registerUser = async (userData) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      deliveryAddresses,
      password,
    } = userData;

    // List of required fields
    const requiredFields = [
      { field: "firstName", value: firstName },
      { field: "lastName", value: lastName },
      { field: "email", value: email },
      { field: "phoneNumber", value: phoneNumber },
      { field: "password", value: password },
    ];

    // Check for missing required fields
    const missingFields = requiredFields
      .filter((field) => !field.value) // Filter out fields with missing values
      .map((field) => field.field); // Extract the names of the missing fields

    // If any required fields are missing, throw an error with the missing field names
    if (missingFields.length > 0) {
      throw new Error(
        `The following fields are required: ${missingFields.join(", ")}`
      );
    }

    // Validate deliveryAddresses
    if (
      !deliveryAddresses ||
      !Array.isArray(deliveryAddresses) ||
      deliveryAddresses.length === 0
    ) {
      throw new Error("At least one delivery address is required");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user
    const user = new User({
      firstName,
      lastName,
      email,
      phoneNumber,
      deliveryAddresses,
      password: hashedPassword,
    });

    // Save the user to the database
    await user.save();

    // Exclude password from the response
    const userResponse = user.toObject();
    delete userResponse.password;

    return userResponse;
  } catch (error) {
    console.error("Error in registerUser service:", error.message);
    throw error; // Re-throw the error for the controller to handle
  }
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  // Generate JWT token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "4800h", // Token expires in 4800 hours (200 days)
  });

  // Convert Mongoose document to a plain JavaScript object
  const userResponse = user.toObject(); // Ensure this line is present
  delete userResponse.password; // Exclude password from the response

  return { user: userResponse, token };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  // Generate a 6-digit reset token
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString(); // Generates a random 6-digit number
  user.resetPasswordToken = resetToken; // Store the plain token (no need to hash it)
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

  await user.save();

  // In a real app, send the token via email
  return resetToken;
};

const resetPassword = async (token, newPassword) => {
  try {
    console.log("Finding user with token:", token); // Log the token

    // Find the user by the reset token and check if it's still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check if the token is still valid
    });

    if (!user) {
      throw new Error("Invalid or expired token");
    }

    console.log("User found:", user); // Log the user

    // Hash the new password
    const saltRounds = 10;
    user.password = await bcrypt.hash(newPassword, saltRounds);

    // Clear the reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Save the updated user
    await user.save();

    return "Password reset successful";
  } catch (error) {
    console.error("Error in resetPassword service:", error.message); // Log the error
    throw error;
  }
};

const updateProfile = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
  }).select("-password");
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid old password");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  // Exclude password from the response
  const userResponse = user.toObject();
  delete userResponse.password;

  return userResponse;
};

const getUserById = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

const getAllUsers = async () => {
  const users = await User.find().select("-password");
  return users;
};

const addAddress = async (userId, addressData) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // If it's the first address or explicitly set as default, make it default
  if (user.deliveryAddresses.length === 0 || addressData.isDefault) {
    user.deliveryAddresses.forEach((addr) => (addr.isDefault = false));
    addressData.isDefault = true;
  }

  user.deliveryAddresses.push(addressData);
  await user.save();
  return user.deliveryAddresses;
};

const updateAddress = async (userId, addressId, updatedData) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const address = user.deliveryAddresses.id(addressId);
  if (!address) throw new Error("Address not found");

  // Update fields
  Object.assign(address, updatedData);

  // Handle default switch
  if (updatedData.isDefault) {
    user.deliveryAddresses.forEach((addr) => {
      addr.isDefault = addr._id.toString() === addressId;
    });
  }

  await user.save();
  return user.deliveryAddresses;
};

const deleteAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const addressIndex = user.deliveryAddresses.findIndex(
    (address) => address._id.toString() === addressId
  );
  if (addressIndex === -1) throw new Error("Address not found");

  // Remove the address from the array using splice
  user.deliveryAddresses.splice(addressIndex, 1);

  // Save the updated user document
  await user.save();
  return user.deliveryAddresses; // Return updated addresses
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  getUserById,
  getAllUsers,
  addAddress,
  updateAddress,
  deleteAddress,
};
