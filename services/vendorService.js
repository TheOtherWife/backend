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

  console.log(vendorData.password);

  // Validate required fields
  if (!password) {
    throw new Error("Password is required");
  }

  // Check if vendor already exists
  const existingVendor = await Vendor.findOne({ email });
  if (existingVendor) {
    throw new Error("Vendor already exists");
  }

  // Hash the password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create a new vendor
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
    password: hashedPassword,
  });

  // Save the vendor to the database
  await vendor.save();

  // Exclude sensitive fields from the response
  const vendorResponse = vendor.toObject();
  delete vendorResponse.password; // Exclude password
  delete vendorResponse.bvn; // Exclude BVN
  delete vendorResponse.accountNumber; // Exclude account number

  return vendorResponse;
};

const loginVendor = async (email, password) => {
  const vendor = await Vendor.findOne({ email });
  if (!vendor) {
    throw new Error("Vendor not found");
  }

  const isPasswordValid = await bcrypt.compare(password, vendor.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  // Generate JWT token
  const token = jwt.sign({ vendorId: vendor._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  // Exclude sensitive fields from the response
  const vendorResponse = vendor.toObject();
  delete vendorResponse.password;
  delete vendorResponse.bvn;
  delete vendorResponse.accountNumber;

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

const changePassword = async (vendorId, oldPassword, newPassword) => {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    throw new Error("Vendor not found");
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, vendor.password);
  if (!isPasswordValid) {
    throw new Error("Invalid old password");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  vendor.password = hashedPassword;
  await vendor.save();

  // Exclude sensitive fields from the response
  const vendorResponse = vendor.toObject();
  delete vendorResponse.password;
  delete vendorResponse.bvn;
  delete vendorResponse.accountNumber;

  return vendorResponse;
};

const updateProfile = async (vendorId, updateData) => {
  const vendor = await Vendor.findByIdAndUpdate(vendorId, updateData, {
    new: true,
  }).select("-password -bvn -accountNumber");
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

const getVendors = async (filters = {}, page = 1, limit = 10) => {
  console.log("got here");
  const { location, name, cuisine } = filters;

  const query = {};

  // Search by location (city or state)
  if (location) {
    query.$or = [
      { city: { $regex: location, $options: "i" } },
      { state: { $regex: location, $options: "i" } },
    ];
  }

  // Search by name (first name or last name)
  if (name) {
    query.$or = [
      { firstName: { $regex: name, $options: "i" } },
      { lastName: { $regex: name, $options: "i" } },
    ];
  }

  // Search by cuisine
  if (cuisine) {
    query.cuisineSpecifications = { $regex: cuisine, $options: "i" };
  }

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // Fetch vendors with pagination
  const vendors = await Vendor.find(query)
    .select("-password -bvn -accountNumber")
    .skip(skip)
    .limit(limit);

  // Get total count of vendors (for pagination metadata)
  const totalVendors = await Vendor.countDocuments(query);

  return {
    vendors,
    totalVendors,
    totalPages: Math.ceil(totalVendors / limit),
    currentPage: page,
  };
};

module.exports = {
  registerVendor,
  loginVendor,
  forgotPassword,
  changePassword,
  updateProfile,
  getVendorById,
  getVendors,
};
