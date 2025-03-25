const Additive = require("../models/additiveModel");

const createAdditive = async (vendorId, additiveData) => {
  try {
    const additive = new Additive({ ...additiveData, vendorId });
    await additive.save();
    return additive;
  } catch (error) {
    console.error("Error in createAdditive service:", error.message);
    throw error;
  }
};

const getAdditivesByVendorId = async (vendorId) => {
  try {
    const additives = await Additive.find({ vendorId });
    return additives;
  } catch (error) {
    console.error("Error in getAdditivesByVendorId service:", error.message);
    throw error;
  }
};

const updateAdditive = async (additiveId, vendorId, updateData) => {
  try {
    const additive = await Additive.findOneAndUpdate(
      { _id: additiveId, vendorId },
      updateData,
      { new: true }
    );

    if (!additive) {
      throw new Error("Additive not found or unauthorized");
    }

    return additive;
  } catch (error) {
    console.error("Error in updateAdditive service:", error.message);
    throw error;
  }
};

const deleteAdditive = async (additiveId, vendorId) => {
  try {
    const additive = await Additive.findOneAndDelete({
      _id: additiveId,
      vendorId,
    });

    if (!additive) {
      throw new Error("Additive not found or unauthorized");
    }

    return additive;
  } catch (error) {
    console.error("Error in deleteAdditive service:", error.message);
    throw error;
  }
};

const makeAdditiveUnavailable = async (additiveId, vendorId) => {
  try {
    const additive = await Additive.findOneAndUpdate(
      { _id: additiveId, vendorId },
      { isAvailable: false },
      { new: true }
    );

    if (!additive) {
      throw new Error("Additive not found or unauthorized");
    }

    return additive;
  } catch (error) {
    console.error("Error in makeAdditiveUnavailable service:", error.message);
    throw error;
  }
};

module.exports = {
  createAdditive,
  getAdditivesByVendorId,
  updateAdditive,
  deleteAdditive,
  makeAdditiveUnavailable,
};
