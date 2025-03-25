const PackageOption = require("../models/packageModel");

// Create a new package option
const createPackageOption = async (vendorId, packageOptionData) => {
  try {
    const packageOption = new PackageOption({ ...packageOptionData, vendorId });
    await packageOption.save();
    return packageOption;
  } catch (error) {
    console.error("Error in createPackageOption service:", error.message);
    throw error;
  }
};

// Get package options for a specific vendor
const getPackageOptionsByVendorId = async (vendorId) => {
  try {
    const packageOptions = await PackageOption.find({ vendorId });
    return packageOptions;
  } catch (error) {
    console.error(
      "Error in getPackageOptionsByVendorId service:",
      error.message
    );
    throw error;
  }
};

// Update a package option
const updatePackageOption = async (packageOptionId, vendorId, updateData) => {
  try {
    const packageOption = await PackageOption.findOneAndUpdate(
      { _id: packageOptionId, vendorId },
      updateData,
      { new: true }
    );

    if (!packageOption) {
      throw new Error("Package option not found or unauthorized");
    }

    return packageOption;
  } catch (error) {
    console.error("Error in updatePackageOption service:", error.message);
    throw error;
  }
};

// Delete a package option
const deletePackageOption = async (packageOptionId, vendorId) => {
  try {
    const packageOption = await PackageOption.findOneAndDelete({
      _id: packageOptionId,
      vendorId,
    });

    if (!packageOption) {
      throw new Error("Package option not found or unauthorized");
    }

    return packageOption;
  } catch (error) {
    console.error("Error in deletePackageOption service:", error.message);
    throw error;
  }
};

// Make a package option unavailable
const makePackageOptionUnavailable = async (packageOptionId, vendorId) => {
  try {
    const packageOption = await PackageOption.findOneAndUpdate(
      { _id: packageOptionId, vendorId },
      { isAvailable: false },
      { new: true }
    );

    if (!packageOption) {
      throw new Error("Package option not found or unauthorized");
    }

    return packageOption;
  } catch (error) {
    console.error(
      "Error in makePackageOptionUnavailable service:",
      error.message
    );
    throw error;
  }
};

module.exports = {
  createPackageOption,
  getPackageOptionsByVendorId,
  updatePackageOption,
  deletePackageOption,
  makePackageOptionUnavailable,
};
