const Vendor = require("../models/Vendor");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail } = require("./emailService");
const mongoose = require("mongoose");
const vendorStatsService = require("./vendorStatsService");

const registerVendor = async (vendorData) => {
  const {
    firstName,
    lastName,
    displayName,
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
    displayImage,
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
    displayName,
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
    displayImage,
    password, // No need to hash here - the pre-save hook will handle it
  });

  // Save the vendor to the database
  await vendor.save();
  await sendEmail({
    to: vendor.email,
    subject: "Welcome to TOW – Let’s Get Your Kitchen Verified!",
    templateName: "welcome_vendor_email",
    variables: {
      FNAME: vendor.firstName,
    },
  });

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

  // Generate a raw token
  const rawToken = crypto.randomBytes(20).toString("hex");

  // Hash it for storing
  vendor.resetPasswordToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  vendor.resetPasswordExpires = Date.now() + 3600000;

  await vendor.save();

  // Send email with raw token (the one vendor will use)
  await sendEmail({
    to: vendor.email,
    subject: "Reset Your Password - TheOtherWife Vendor Account",
    templateName: "forgot_password_vendor_email",
    variables: {
      FNAME: vendor.firstName,
      RESET_CODE: rawToken,
    },
  });

  return true;
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

// const getVendorById = async (vendorId, includeStats = false) => {
//   const vendor = await Vendor.findById(vendorId)
//     .select("-password -bvn -accountNumber")
//     .lean(); // Add .lean() to convert to plain JS object

//   if (!vendor) {
//     throw new Error("Vendor not found");
//   }

//   if (includeStats) {
//     const stats = await vendorStatsService.getVendorStats(vendorId);
//     return {
//       ...vendor,
//       stats, // Include stats as a nested object
//     };
//   }

//   return vendor;
// };

const getVendorById = async (vendorId, includeStats = false) => {
  // First get the vendor without stats
  const vendor = await Vendor.findById(vendorId)
    .select("-password -bvn -accountNumber")
    .lean()
    .exec();

  if (!vendor) {
    throw new Error("Vendor not found");
  }

  // If stats aren't requested, return early
  if (!includeStats) {
    return vendor;
  }

  // Get stats separately
  const stats = await vendorStatsService.getVendorStats(vendorId);

  // Create a new plain JavaScript object
  const result = {
    ...vendor,
    stats: {
      ...stats,
    },
  };

  // Debug log to verify merging worked
  console.log("Merged vendor with stats:", JSON.stringify(result, null, 2));

  return result;
};

const getVendors = async (filters = {}, page = 1, limit = 24) => {
  const {
    searchQuery,
    minPrice,
    maxPrice,
    preparationType,
    minRating,
    category,
    location,
  } = filters;

  // Base query for vendor filtering
  const vendorQuery = {};

  // Search filter
  if (searchQuery) {
    vendorQuery.$or = [
      { firstName: { $regex: searchQuery, $options: "i" } },
      { lastName: { $regex: searchQuery, $options: "i" } },
      { displayName: { $regex: searchQuery, $options: "i" } },
      { cuisineSpecifications: { $regex: searchQuery, $options: "i" } },
    ];
  }

  // Location filter
  if (location) {
    vendorQuery.$or = [
      { city: { $regex: location, $options: "i" } },
      { state: { $regex: location, $options: "i" } },
    ];
  }

  // Category filter
  if (category && category !== "All Meal") {
    vendorQuery.cuisineSpecifications = { $regex: category, $options: "i" };
  }

  // Rating filter
  if (minRating) {
    vendorQuery.averageRating = { $gte: Number(minRating) };
  }

  // Build aggregation pipeline
  const pipeline = [
    { $match: vendorQuery },
    {
      $lookup: {
        from: "menus",
        localField: "_id",
        foreignField: "vendorId",
        as: "menuItems",
      },
    },
    { $unwind: { path: "$menuItems", preserveNullAndEmptyArrays: true } },
  ];

  // Menu item filters
  const menuItemFilters = {};

  // Price filter
  if (minPrice || maxPrice) {
    menuItemFilters["menuItems.basePrice"] = {};
    if (minPrice)
      menuItemFilters["menuItems.basePrice"].$gte = Number(minPrice);
    if (maxPrice)
      menuItemFilters["menuItems.basePrice"].$lte = Number(maxPrice);
  }

  // Preparation type filter
  if (preparationType) {
    menuItemFilters["menuItems.preparationType"] = {
      $in: preparationType.split(","),
    };
  }

  // Add menu item filters if any exist
  if (Object.keys(menuItemFilters).length > 0) {
    pipeline.push({ $match: menuItemFilters });
  }

  // Reconstruct vendors with filtered menu items
  pipeline.push({
    $group: {
      _id: "$_id",
      doc: { $first: "$$ROOT" },
      menuItems: { $push: "$menuItems" },
    },
  });

  // Reshape document
  pipeline.push({
    $replaceRoot: {
      newRoot: {
        $mergeObjects: ["$doc", { menuItems: "$menuItems" }],
      },
    },
  });

  // Pagination
  pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });

  // Execute aggregation
  const vendors = await Vendor.aggregate(pipeline);

  // Get total count (simplified count without menu item filters)
  const totalVendors = await Vendor.countDocuments(vendorQuery);

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
