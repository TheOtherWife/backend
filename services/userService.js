const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("./emailService");
const { loadTemplate } = require("../utils/emailTemplateLoader");

const registerUser = async (data) => {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    deliveryAddresses,
    password,
  } = data;

  if (!firstName || !lastName || !email || !phoneNumber || !password)
    throw new Error("All required fields must be provided");

  if (
    !deliveryAddresses ||
    !Array.isArray(deliveryAddresses) ||
    deliveryAddresses.length === 0
  )
    throw new Error("At least one delivery address is required");

  const exists = await User.findOne({ email });
  if (exists) throw new Error("User already exists");

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    firstName,
    lastName,
    email,
    phoneNumber,
    deliveryAddresses,
    password: hashed,
  });

  const userObj = user.toObject();
  delete userObj.password;

  // Send welcome email
  const htmlContent = loadTemplate("welcome_user_email", {
    FNAME: user.firstName,
  });
  await sendEmail({
    subject: "Welcome!",
    htmlContent,
    fromName: "TheOtherWife",
  });

  return userObj;
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  if (user.authProvider === "google")
    throw new Error("Please login with Google");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid password");

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, token };
};

/**
 * Google login: creates user if not exists
 */
const googleLogin = async ({
  email,
  firstName,
  lastName,
  googleId,
  profileImage,
}) => {
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      email,
      firstName,
      lastName,
      googleId,
      authProvider: "google",
      password: null,
      profileImage,
    });
  }

  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj };
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
  // Send reset code via email
  await sendEmail({
    to: user.email,
    subject: "Reset Your Password - TheOtherWife",
    templateName: "forgot_password_user_email",
    variables: {
      FNAME: user.firstName,
      RESET_CODE: resetToken,
    },
  });

  return true;
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
  googleLogin,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  getUserById: async (id) => {
    const user = await User.findById(id).select("-password");
    if (!user) throw new Error("User not found");
    return user;
  },
  getAllUsers: async () => User.find().select("-password"),
  addAddress,
  updateAddress,
  deleteAddress,
};
