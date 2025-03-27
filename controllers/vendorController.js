const vendorService = require("../services/vendorService");

const cloudinary = require("cloudinary").v2;

const registerVendor = async (req, res) => {
  try {
    const vendorData = req.body;

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

    // Call the service to register the vendor
    const vendor = await vendorService.registerVendor(vendorData);

    res.status(201).json({
      message: "Vendor registered successfully",
      vendor,
    });
  } catch (error) {
    console.error("Error in registerVendor controller:", error.message);

    // Clean up uploaded files if registration failed
    if (vendorData.idImage) {
      await cloudinary.uploader.destroy(vendorData.idImage);
    }
    if (vendorData.certificateImage) {
      await cloudinary.uploader.destroy(vendorData.certificateImage);
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
    const resetToken = await vendorService.forgotPassword(email);

    res.status(200).json({
      message: "Password reset token sent",
      resetToken, // In production, send this via email
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const vendorId = req.vendor.vendorId; // Assuming vendorId is extracted from JWT
    const { oldPassword, newPassword } = req.body;
    const vendor = await vendorService.changePassword(
      vendorId,
      oldPassword,
      newPassword
    );

    res.status(200).json({
      message: "Password changed successfully",
      vendor,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const vendorId = req.vendor.vendorId;
    const updateData = req.body;

    // Remove any password-related fields from updates
    delete updateData.password;
    delete updateData.newPassword;
    delete updateData.currentPassword;
    delete updateData.confirmPassword;

    // Validate update data
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error("No valid fields provided for update");
    }

    // Handle ID image upload if exists
    if (req.files?.idImage) {
      try {
        const idImage = req.files.idImage[0];
        const result = await cloudinary.uploader.upload(idImage.path, {
          folder: "vendor_documents",
          resource_type: "image",
        });
        updateData.idImage = result.secure_url;

        // Delete old image if exists
        const vendor = await Vendor.findById(vendorId);
        if (vendor.idImage) {
          const publicId = vendor.idImage.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`vendor_documents/${publicId}`);
        }
      } catch (uploadError) {
        console.error("ID Image upload failed:", uploadError);
        throw new Error("Failed to upload ID image");
      }
    }

    // Handle certificate image upload if exists
    if (req.files?.certificateImage) {
      try {
        const certImage = req.files.certificateImage[0];
        const result = await cloudinary.uploader.upload(certImage.path, {
          folder: "vendor_documents",
          resource_type: "image",
        });
        updateData.certificateImage = result.secure_url;

        // Delete old image if exists
        const vendor = await Vendor.findById(vendorId);
        if (vendor.certificateImage) {
          const publicId = vendor.certificateImage
            .split("/")
            .pop()
            .split(".")[0];
          await cloudinary.uploader.destroy(`vendor_documents/${publicId}`);
        }
      } catch (uploadError) {
        console.error("Certificate Image upload failed:", uploadError);
        throw new Error("Failed to upload certificate image");
      }
    }

    // Update profile data (excluding sensitive fields)
    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
        select: "-password -__v -refreshToken", // Exclude sensitive fields
      }
    );

    if (!vendor) {
      throw new Error("Vendor not found");
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        vendor: vendor.toObject({ getters: true, virtuals: false }),
      },
    });
  } catch (error) {
    console.error("Error in updateProfile controller:", error.message);

    // Clean up uploaded files if update failed
    try {
      if (req.files?.idImage && updateData.idImage) {
        const publicId = updateData.idImage.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`vendor_documents/${publicId}`);
      }
      if (req.files?.certificateImage && updateData.certificateImage) {
        const publicId = updateData.certificateImage
          .split("/")
          .pop()
          .split(".")[0];
        await cloudinary.uploader.destroy(`vendor_documents/${publicId}`);
      }
    } catch (cleanupError) {
      console.error("Error during cleanup:", cleanupError);
    }

    res.status(400).json({
      success: false,
      message: error.message || "Profile update failed",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const getVendor = async (req, res) => {
  try {
    const vendorId = req.params.id;
    const vendor = await vendorService.getVendorById(vendorId);

    res.status(200).json({
      message: "Vendor retrieved successfully",
      vendor,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getVendors = async (req, res) => {
  try {
    const { location, name, cuisine, page = 1, limit = 24 } = req.query;
    const filters = { location, name, cuisine };

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const { vendors, totalVendors, totalPages, currentPage } =
      await vendorService.getVendors(filters, pageNumber, limitNumber);

    res.status(200).json({
      message: "Vendors retrieved successfully",
      vendors,
      pagination: {
        totalVendors,
        totalPages,
        currentPage,
        limit: limitNumber,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
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
};
