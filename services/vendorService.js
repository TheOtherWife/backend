const Vendor = require("../models/Vendor");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const registerVendor = async (vendorData) => {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    alternatePhoneNumber,
    state,
    city,
    addresses,
    socialMedia,
    yearsOfExperience,
    cuisineSpecifications,
    bvn,
    accountNumber,
    accountName,
    bankName,
    idImage,
    certificateImage,
    password,
  } = vendorData;

  // Validate required fields
  if (!password) {
    throw new Error("Password is required");
  }

  // Check if vendor already exists
  const existingVendor = await Vendor.findOne({ email });
  if (existingVendor) {
    throw new Error("Vendor already exists");
  }

  // Create a new vendor - password will be hashed by the pre-save hook
  const vendor = new Vendor({
    firstName,
    lastName,
    email,
    phoneNumber,
    alternatePhoneNumber,
    state,
    city,
    addresses,
    socialMedia,
    yearsOfExperience,
    cuisineSpecifications,
    bvn,
    accountNumber,
    accountName,
    bankName,
    idImage,
    certificateImage,
    password, // No need to hash here - the pre-save hook will handle it
  });

  // Save the vendor to the database
  await vendor.save();

  // Exclude sensitive fields from the response
  const vendorResponse = vendor.toObject();
  delete vendorResponse.password;
  delete vendorResponse.__v;

  return vendorResponse;
};

const loginVendor = async (email, password) => {
  // Add .select('+password') to include the password field
  const vendor = await Vendor.findOne({ email }).select("+password");

  if (!vendor) {
    throw new Error("Vendor not found");
  }

  // Add validation for empty password
  if (!password || !vendor.password) {
    throw new Error("Password is required");
  }

  // Use the instance method instead of direct bcrypt.compare
  const isPasswordValid = await vendor.correctPassword(
    password,
    vendor.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  // Generate JWT token
  const token = jwt.sign({ vendorId: vendor._id }, process.env.JWT_SECRET, {
    expiresIn: "80000h",
  });

  // Exclude sensitive fields from the response
  const vendorResponse = vendor.toObject();
  delete vendorResponse.password;

  return { vendor: vendorResponse, token };
};

const forgotPassword = async (email) => {
  const vendor = await Vendor.findOne({ email });
  if (!vendor) {
    throw new Error("Vendor not found");
  }

  // Generate a reset token
  const resetToken = crypto.randomBytes(20).toString("hex");
  vendor.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  vendor.resetPasswordExpires = Date.now() + 3600000; // 1 hour

  await vendor.save();

  // In a real app, send the token via email
  return resetToken;
};

const changePassword = async (vendorId, currentPassword, newPassword) => {
  // Find vendor with password field included
  const vendor = await Vendor.findById(vendorId).select("+password");
  if (!vendor) {
    throw new Error("Vendor not found");
  }

  // Verify current password using the model method
  const isMatch = await vendor.correctPassword(
    currentPassword,
    vendor.password
  );
  if (!isMatch) {
    throw new Error("Current password is incorrect");
  }

  // Check if new password is different
  const isSame = await vendor.correctPassword(newPassword, vendor.password);
  if (isSame) {
    throw new Error("New password must be different from current password");
  }

  // Update password - the pre-save hook will handle hashing
  vendor.password = newPassword;
  await vendor.save();

  // Generate response without sensitive data
  const vendorResponse = vendor.toObject();
  delete vendorResponse.password;
  delete vendorResponse.__v;
  delete vendorResponse.refreshToken;

  return vendorResponse;
};

const updateProfile = async (vendorId, updateData) => {
  const vendor = await Vendor.findByIdAndUpdate(vendorId, updateData, {
    new: true,
  }).select("-password");
  if (!vendor) {
    throw new Error("Vendor not found");
  }
  return vendor;
};

const getVendorById = async (vendorId) => {
  const vendor = await Vendor.findById(vendorId).select(
    "-password -bvn -accountNumber"
  );
  if (!vendor) {
    throw new Error("Vendor not found");
  }
  return vendor;
};

// vendorService.js
const getVendors = async (filters = {}, page = 1, limit = 10) => {
  const {
    location,
    name,
    cuisine,
    minPrice,
    maxPrice,
    preparationType,
    minRating,
    category,
    searchQuery,
  } = filters;

  const query = {};

  // Search by multiple fields if searchQuery is provided
  if (searchQuery) {
    query.$or = [
      { firstName: { $regex: searchQuery, $options: "i" } },
      { lastName: { $regex: searchQuery, $options: "i" } },
      { "menuItems.name": { $regex: searchQuery, $options: "i" } },
      { "menuItems.description": { $regex: searchQuery, $options: "i" } },
      { cuisineSpecifications: { $regex: searchQuery, $options: "i" } },
    ];
  }

  // Location filter (city or state)
  if (location) {
    query.$or = [
      { city: { $regex: location, $options: "i" } },
      { state: { $regex: location, $options: "i" } },
    ];
  }

  // Category filter (cuisine type)
  if (category) {
    query.cuisineSpecifications = { $regex: category, $options: "i" };
  }

  // Price range filter (assuming vendors have menu items with prices)
  if (minPrice || maxPrice) {
    query["menuItems.price"] = {};
    if (minPrice) query["menuItems.price"].$gte = Number(minPrice);
    if (maxPrice) query["menuItems.price"].$lte = Number(maxPrice);
  }

  // Preparation type filter
  if (preparationType) {
    query["menuItems.preparationType"] = { $in: preparationType.split(",") };
  }

  // Rating filter
  if (minRating) {
    query.averageRating = { $gte: Number(minRating) };
  }

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // Fetch vendors with their menu items and apply aggregation for filtering
  const vendors = await Vendor.aggregate([
    { $match: query },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: "menuitems", // Assuming you have a MenuItem collection
        localField: "_id",
        foreignField: "vendor",
        as: "menuItems",
      },
    },
    {
      $addFields: {
        averageRating: { $avg: "$reviews.rating" }, // Calculate average rating
      },
    },
  ]);

  // Get total count of vendors (for pagination metadata)
  const totalVendors = await Vendor.countDocuments(query);

  return {
    vendors,
    totalVendors,
    totalPages: Math.ceil(totalVendors / limit),
    currentPage: page,
  };
};

async function updateVendorRating(vendorId) {
  // Get all delivered orders for this vendor with ratings
  const orders = await Order.find({
    vendorId,
    status: "delivered",
    "rating.score": { $exists: true },
  });

  if (orders.length === 0) return;

  // Calculate average rating
  const totalRatings = orders.reduce(
    (sum, order) => sum + order.rating.score,
    0
  );
  const averageRating = totalRatings / orders.length;

  // Update vendor's average rating
  await Vendor.findByIdAndUpdate(vendorId, {
    averageRating: parseFloat(averageRating.toFixed(1)),
    ratingCount: orders.length,
  });
}

module.exports = {
  registerVendor,
  loginVendor,
  forgotPassword,
  changePassword,
  updateProfile,
  getVendorById,
  getVendors,
  updateVendorRating,
};
