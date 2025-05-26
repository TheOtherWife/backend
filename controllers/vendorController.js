const vendorService = require("../services/vendorService");
const Vendor = require("../models/Vendor"); // ADD THIS LINE
const mongoose = require("mongoose");
const vendorStatsService = require("../services/vendorStatsService");

const cloudinary = require("cloudinary").v2;

const registerVendor = async (req, res) => {
  let vendorData = {}; // Define vendorData at the start of the function

  try {
    vendorData = req.body;

    // Upload ID image if exists
    if (req.files?.idImage) {
      const idImage = req.files.idImage[0];
      const result = await cloudinary.uploader.upload(idImage.path);
      vendorData.idImage = result.secure_url;
    }

    // Upload certificate image if exists
    if (req.files?.certificateImage) {
      const certImage = req.files.certificateImage[0];
      const result = await cloudinary.uploader.upload(certImage.path);
      vendorData.certificateImage = result.secure_url;
    }

    // Upload display image if exists
    if (req.files?.displayImage) {
      const displayImage = req.files.displayImage[0];
      const result = await cloudinary.uploader.upload(displayImage.path);
      vendorData.displayImage = result.secure_url;
    }

    // Call the service to register the vendor
    const vendor = await vendorService.registerVendor(vendorData);

    res.status(201).json({
      message: "Vendor registered successfully",
      vendor,
    });
  } catch (error) {
    console.error("Error in registerVendor controller:", error.message);

    // Clean up uploaded files if registration failed
    try {
      if (vendorData?.idImage) {
        await cloudinary.uploader.destroy(vendorData.idImage);
      }
      if (vendorData?.certificateImage) {
        await cloudinary.uploader.destroy(vendorData.certificateImage);
      }
      if (vendorData?.displayImage) {
        await cloudinary.uploader.destroy(vendorData.displayImage);
      }
    } catch (cleanupError) {
      console.error("Error cleaning up uploaded files:", cleanupError.message);
    }

    res.status(400).json({ message: error.message });
  }
};

const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { vendor, token } = await vendorService.loginVendor(email, password);

    res.status(200).json({
      message: "Login successful",
      vendor,
      token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await vendorService.forgotPassword(email);

    res.status(200).json({
      message:
        "If the email exists, a reset code has been sent. Please check your inbox.",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const vendorId = req.vendor.vendorId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "All password fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    // Validate password strength
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character",
      });
    }

    // Call service to change password
    const updatedVendor = await vendorService.changePassword(
      vendorId,
      currentPassword,
      newPassword
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
      data: {
        vendor: updatedVendor,
      },
    });
  } catch (error) {
    console.error("Password change error:", error.message);
    res.status(400).json({
      success: false,
      message: error.message || "Password change failed",
    });
  }
};

const updateProfile = async (req, res) => {
  // Initialize fileHandlers at the beginning
  const fileHandlers = {
    idImage: null,
    certificateImage: null,
  };

  try {
    const vendorId = req.vendor.vendorId;

    // Validate vendorId
    if (!vendorId || !mongoose.Types.ObjectId.isValid(vendorId)) {
      throw new Error("Invalid vendor ID format");
    }

    const updateData = req.body;
    console.log("Update data:", JSON.stringify(updateData, null, 2));

    // Remove any password-related fields from updates
    delete updateData.password;
    delete updateData.newPassword;
    delete updateData.currentPassword;
    delete updateData.confirmPassword;

    // Validate update data
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error("No valid fields provided for update");
    }

    // Process ID image if exists
    if (req.files?.idImage) {
      try {
        const idImage = req.files.idImage[0];
        console.log("Uploading ID image...");
        const result = await cloudinary.uploader.upload(idImage.path, {
          folder: "vendor_documents",
          resource_type: "image",
        });
        updateData.idImage = result.secure_url;
        fileHandlers.idImage = result;

        // Get current vendor data
        const currentVendor = await Vendor.findById(vendorId).select("idImage");
        if (currentVendor?.idImage) {
          const publicId = currentVendor.idImage.split("/").pop().split(".")[0];
          console.log("Deleting old ID image:", publicId);
          await cloudinary.uploader.destroy(`vendor_documents/${publicId}`);
        }
      } catch (uploadError) {
        console.error("ID Image upload failed:", uploadError);
        throw new Error("Failed to upload ID image");
      }
    }

    // Process Display image if exists
    if (req.files?.displayImage) {
      try {
        const displayImage = req.files.displayImage[0];
        console.log("Uploading ID image...");
        const result = await cloudinary.uploader.upload(displayImage.path, {
          folder: "vendor_documents",
          resource_type: "image",
        });
        updateData.displayImage = result.secure_url;
        fileHandlers.displayImage = result;

        // Get current vendor data
        const currentVendor = await Vendor.findById(vendorId).select(
          "displayImage"
        );
        if (currentVendor?.displayImage) {
          const publicId = currentVendor.displayImage
            .split("/")
            .pop()
            .split(".")[0];
          console.log("Deleting old Display image:", publicId);
          await cloudinary.uploader.destroy(`vendor_documents/${publicId}`);
        }
      } catch (uploadError) {
        console.error("ID Image upload failed:", uploadError);
        throw new Error("Failed to upload ID image");
      }
    }

    // Process certificate image if exists
    if (req.files?.certificateImage) {
      try {
        const certImage = req.files.certificateImage[0];
        console.log("Uploading certificate image...");
        const result = await cloudinary.uploader.upload(certImage.path, {
          folder: "vendor_documents",
          resource_type: "image",
        });
        updateData.certificateImage = result.secure_url;
        fileHandlers.certificateImage = result;

        // Get current vendor data
        const currentVendor = await Vendor.findById(vendorId).select(
          "certificateImage"
        );
        if (currentVendor?.certificateImage) {
          const publicId = currentVendor.certificateImage
            .split("/")
            .pop()
            .split(".")[0];
          console.log("Deleting old certificate image:", publicId);
          await cloudinary.uploader.destroy(`vendor_documents/${publicId}`);
        }
      } catch (uploadError) {
        console.error("Certificate Image upload failed:", uploadError);
        throw new Error("Failed to upload certificate image");
      }
    }

    // Update profile data
    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
        select: "-password -__v -refreshToken",
      }
    ).lean();

    if (!updatedVendor) {
      throw new Error("Vendor not found");
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        vendor: updatedVendor,
      },
    });
  } catch (error) {
    console.error("Error in updateProfile controller:", error);

    // Clean up uploaded files if update failed
    try {
      if (fileHandlers.idImage) {
        console.log("Cleaning up ID image:", fileHandlers.idImage.public_id);
        await cloudinary.uploader.destroy(fileHandlers.idImage.public_id);
      }
      if (fileHandlers.certificateImage) {
        console.log(
          "Cleaning up certificate image:",
          fileHandlers.certificateImage.public_id
        );
        await cloudinary.uploader.destroy(
          fileHandlers.certificateImage.public_id
        );
      }
    } catch (cleanupError) {
      console.error("Error during cleanup:", cleanupError);
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Profile update failed",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// const getVendor = async (req, res) => {
//   try {
//     const vendorId = req.params.id;
//     const vendor = await vendorService.getVendorById(vendorId);

//     res.status(200).json({
//       message: "Vendor retrieved successfully",
//       vendor,
//     });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

const testStats = async (req, res) => {
  try {
    const vendorId = req.params.id;
    const stats = await vendorStatsService.getVendorStats(vendorId);
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVendor = async (req, res) => {
  try {
    const vendorId = req.params.id;
    const includeStats = "true"; // Correct evaluation

    // console.log(
    //   `Request received for vendor ${vendorId}, includeStats: ${includeStats}`
    // );

    const vendor = await vendorService.getVendorById(vendorId, includeStats);

    res.status(200).json({
      message: "Vendor retrieved successfully",
      vendor: vendor,
    });
  } catch (error) {
    console.error("Error in getVendor:", error);
    res.status(500).json({
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const getVendors = async (req, res) => {
  try {
    const {
      searchQuery,
      minPrice,
      maxPrice,
      preparationType,
      minRating,
      category,
      location,
      city, // Add city parameter
      page = 1,
      limit = 24,
      userLongitude,
      userLatitude,
    } = req.query;

    // Parse user location if provided
    const userLocation =
      userLongitude &&
      userLatitude &&
      !isNaN(userLongitude) &&
      !isNaN(userLatitude)
        ? {
            longitude: parseFloat(userLongitude),
            latitude: parseFloat(userLatitude),
          }
        : null;

    const filters = {
      searchQuery,
      minPrice,
      maxPrice,
      preparationType,
      minRating,
      category,
      location,
      city, // Add city to filters
    };

    const result = await vendorService.getVendorsWithDishes(
      filters,
      Number(page),
      Number(limit),
      userLocation
    );

    res.status(200).json({
      message: "Vendors and dishes retrieved successfully",
      popularDishes: result.popularDishes,
      dishesJustForYou: result.dishesJustForYou,
      closestStores: result.closestStores,
    });
  } catch (error) {
    console.error("Error in getVendors controller:", error);
    res.status(500).json({
      message: "Error fetching vendors and dishes",
      error: error.message,
    });
  }
};

const getVendorDashboardStats = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const stats = await vendorStatsService.getVendorStats(vendorId);
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVendorEarnings = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const days = parseInt(req.query.days) || 30;
    const earnings = await vendorStatsService.getVendorEarningsHistory(
      vendorId,
      days
    );
    res.status(200).json(earnings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const updateOrderStatus = async (req, res) => {
//   try {
//     const order = await Order.findByIdAndUpdate(
//       req.params.id,
//       { status: req.body.status },
//       { new: true }
//     );

//     // Emit real-time update to vendor
//     io.to(`vendor-${order.vendorId}`).emit("order-updated", {
//       orderId: order._id,
//       newStatus: order.status,
//     });

//     res.status(200).json(order);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const getVendorProfile = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const includeStats = req.query.stats === "true";

    const vendor = await vendorService.getVendorById(vendorId, includeStats);

    res.status(200).json({
      message: "Vendor retrieved successfully",
      vendor: vendor,
    });
  } catch (error) {
    console.error("Error in getVendorProfile:", error);
    res.status(500).json({
      message: error.message,
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

module.exports = {
  registerVendor,
  loginVendor,
  forgotPassword,
  changePassword,
  updateProfile,
  getVendor,
  getVendors,
  getVendorDashboardStats,
  getVendorEarnings,
  testStats,
  getVendorProfile,
};
