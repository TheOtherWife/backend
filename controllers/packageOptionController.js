const packageOptionService = require("../services/packageOptionService");
const { cloudinaryUpload } = require("../utils/cloudinary"); // Import the Cloudinary upload function

// Create a new package option
const createPackageOption = async (req, res) => {
  try {
    const { vendorId } = req.vendor;
    const packageOptionData = req.body;

    // If file was uploaded, upload to Cloudinary
    if (req.file) {
      const cloudinaryResponse = await cloudinaryUpload(req.file); // Upload the file to Cloudinary
      packageOptionData.image = cloudinaryResponse.secure_url; // Save the Cloudinary URL
    }

    const packageOption = await packageOptionService.createPackageOption(
      vendorId,
      packageOptionData
    );

    res.status(201).json({
      message: "Package option created successfully",
      packageOption,
    });
  } catch (error) {
    console.error("Error in createPackageOption controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// Get package options for a specific vendor
const getPackageOptionsByVendorId = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const packageOptions =
      await packageOptionService.getPackageOptionsByVendorId(vendorId);

    res.status(200).json({
      message: "Package options retrieved successfully",
      packageOptions,
    });
  } catch (error) {
    console.error(
      "Error in getPackageOptionsByVendorId controller:",
      error.message
    );
    res.status(400).json({ message: error.message });
  }
};

// Update a package option
const updatePackageOption = async (req, res) => {
  try {
    const { vendorId } = req.vendor;
    const { packageOptionId } = req.params;
    const updateData = req.body;

    // If file was uploaded, upload to Cloudinary
    if (req.file) {
      const cloudinaryResponse = await cloudinaryUpload(req.file); // Upload the file to Cloudinary
      updateData.image = cloudinaryResponse.secure_url; // Save the Cloudinary URL
    }

    const packageOption = await packageOptionService.updatePackageOption(
      packageOptionId,
      vendorId,
      updateData
    );

    res.status(200).json({
      message: "Package option updated successfully",
      packageOption,
    });
  } catch (error) {
    console.error("Error in updatePackageOption controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// Delete a package option
const deletePackageOption = async (req, res) => {
  try {
    const { vendorId } = req.vendor;
    const { packageOptionId } = req.params;

    const packageOption = await packageOptionService.deletePackageOption(
      packageOptionId,
      vendorId
    );

    res.status(200).json({
      message: "Package option deleted successfully",
      packageOption,
    });
  } catch (error) {
    console.error("Error in deletePackageOption controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// Make a package option unavailable
const makePackageOptionUnavailable = async (req, res) => {
  try {
    const { vendorId } = req.vendor;
    const { packageOptionId } = req.params;

    const packageOption =
      await packageOptionService.makePackageOptionUnavailable(
        packageOptionId,
        vendorId
      );

    res.status(200).json({
      message: "Package option made unavailable successfully",
      packageOption,
    });
  } catch (error) {
    console.error(
      "Error in makePackageOptionUnavailable controller:",
      error.message
    );
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createPackageOption,
  getPackageOptionsByVendorId,
  updatePackageOption,
  deletePackageOption,
  makePackageOptionUnavailable,
};
