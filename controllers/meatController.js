const meatService = require("../services/meatService");
const { cloudinaryUpload } = require("../utils/cloudinary"); // Import the Cloudinary upload function

// Create a new meat
const createMeat = async (req, res) => {
  try {
    const { vendorId } = req.vendor;
    const meatData = req.body;
    // If file was uploaded, upload to Cloudinary
    if (req.file) {
      const cloudinaryResponse = await cloudinaryUpload(req.file); // Upload the file to Cloudinary
      meatData.image = cloudinaryResponse.secure_url; // Save the Cloudinary URL
    }

    const meat = await meatService.createMeat(vendorId, meatData);

    res.status(201).json({
      message: "Meat created successfully",
      meat,
    });
  } catch (error) {
    console.error("Error in createMeat controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// Get meats for a specific vendor
const getMeatsByVendorId = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const meats = await meatService.getMeatsByVendorId(vendorId);

    res.status(200).json({
      message: "Meats retrieved successfully",
      meats,
    });
  } catch (error) {
    console.error("Error in getMeatsByVendorId controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// Update a meat
const updateMeat = async (req, res) => {
  try {
    const { vendorId } = req.vendor;
    const { meatId } = req.params;
    const updateData = req.body;

    // If file was uploaded, upload to Cloudinary
    if (req.file) {
      const cloudinaryResponse = await cloudinaryUpload(req.file); // Upload the file to Cloudinary
      updateData.image = cloudinaryResponse.secure_url; // Save the Cloudinary URL
    }

    const meat = await meatService.updateMeat(meatId, vendorId, updateData);

    res.status(200).json({
      message: "Meat updated successfully",
      meat,
    });
  } catch (error) {
    console.error("Error in updateMeat controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// Delete a meat
const deleteMeat = async (req, res) => {
  try {
    const { vendorId } = req.vendor;
    const { meatId } = req.params;

    const meat = await meatService.deleteMeat(meatId, vendorId);

    res.status(200).json({
      message: "Meat deleted successfully",
      meat,
    });
  } catch (error) {
    console.error("Error in deleteMeat controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// Make a meat unavailable
const makeMeatUnavailable = async (req, res) => {
  try {
    const { vendorId } = req.vendor;
    const { meatId } = req.params;

    const meat = await meatService.makeMeatUnavailable(meatId, vendorId);

    res.status(200).json({
      message: "Meat made unavailable successfully",
      meat,
    });
  } catch (error) {
    console.error("Error in makeMeatUnavailable controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createMeat,
  getMeatsByVendorId,
  updateMeat,
  deleteMeat,
  makeMeatUnavailable,
};
