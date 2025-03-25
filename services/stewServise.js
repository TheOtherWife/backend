const Stew = require("../models/stewModel");

// Create a new stew
const createStew = async (vendorId, stewData) => {
  try {
    const stew = new Stew({ ...stewData, vendorId });
    await stew.save();
    return stew;
  } catch (error) {
    console.error("Error in createStew service:", error.message);
    throw error;
  }
};

// Get stews for a specific vendor
const getStewsByVendorId = async (vendorId) => {
  try {
    const stews = await Stew.find({ vendorId });
    return stews;
  } catch (error) {
    console.error("Error in getStewsByVendorId service:", error.message);
    throw error;
  }
};

// Update a stew
const updateStew = async (stewId, vendorId, updateData) => {
  try {
    const stew = await Stew.findOneAndUpdate(
      { _id: stewId, vendorId },
      updateData,
      { new: true }
    );

    if (!stew) {
      throw new Error("Stew not found or unauthorized");
    }

    return stew;
  } catch (error) {
    console.error("Error in updateStew service:", error.message);
    throw error;
  }
};

// Delete a stew
const deleteStew = async (stewId, vendorId) => {
  try {
    const stew = await Stew.findOneAndDelete({ _id: stewId, vendorId });

    if (!stew) {
      throw new Error("Stew not found or unauthorized");
    }

    return stew;
  } catch (error) {
    console.error("Error in deleteStew service:", error.message);
    throw error;
  }
};

// Make a stew unavailable
const makeStewUnavailable = async (stewId, vendorId) => {
  try {
    const stew = await Stew.findOneAndUpdate(
      { _id: stewId, vendorId },
      { isAvailable: false },
      { new: true }
    );

    if (!stew) {
      throw new Error("Stew not found or unauthorized");
    }

    return stew;
  } catch (error) {
    console.error("Error in makeStewUnavailable service:", error.message);
    throw error;
  }
};

module.exports = {
  createStew,
  getStewsByVendorId,
  updateStew,
  deleteStew,
  makeStewUnavailable,
};
