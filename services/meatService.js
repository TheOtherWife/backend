const Meat = require("../models/meatModel");

// Create a new meat
const createMeat = async (vendorId, meatData) => {
  try {
    const meat = new Meat({ ...meatData, vendorId });
    await meat.save();
    return meat;
  } catch (error) {
    console.error("Error in createMeat service:", error.message);
    throw error;
  }
};

// Get meats for a specific vendor
const getMeatsByVendorId = async (vendorId) => {
  try {
    const meats = await Meat.find({ vendorId });
    return meats;
  } catch (error) {
    console.error("Error in getMeatsByVendorId service:", error.message);
    throw error;
  }
};

// Update a meat
const updateMeat = async (meatId, vendorId, updateData) => {
  try {
    const meat = await Meat.findOneAndUpdate(
      { _id: meatId, vendorId },
      updateData,
      { new: true }
    );

    if (!meat) {
      throw new Error("Meat not found or unauthorized");
    }

    return meat;
  } catch (error) {
    console.error("Error in updateMeat service:", error.message);
    throw error;
  }
};

// Delete a meat
const deleteMeat = async (meatId, vendorId) => {
  try {
    const meat = await Meat.findOneAndDelete({ _id: meatId, vendorId });

    if (!meat) {
      throw new Error("Meat not found or unauthorized");
    }

    return meat;
  } catch (error) {
    console.error("Error in deleteMeat service:", error.message);
    throw error;
  }
};

// Make a meat unavailable
const makeMeatUnavailable = async (meatId, vendorId) => {
  try {
    const meat = await Meat.findOneAndUpdate(
      { _id: meatId, vendorId },
      { isAvailable: false },
      { new: true }
    );

    if (!meat) {
      throw new Error("Meat not found or unauthorized");
    }

    return meat;
  } catch (error) {
    console.error("Error in makeMeatUnavailable service:", error.message);
    throw error;
  }
};

module.exports = {
  createMeat,
  getMeatsByVendorId,
  updateMeat,
  deleteMeat,
  makeMeatUnavailable,
};
