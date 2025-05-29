const stewService = require("../services/stewServise");
const { cloudinaryUpload } = require("../utils/cloudinary"); // Import the Cloudinary upload function

// Create a new stew
const createStew = async (req, res) => {
  try {
    const { vendorId } = req.vendor;
    const stewData = req.body;
    console.log(stewData);

    // If file was uploaded, upload to Cloudinary
    if (req.file) {
      const cloudinaryResponse = await cloudinaryUpload(req.file); // Upload the file to Cloudinary
      stewData.image = cloudinaryResponse.secure_url; // Save the Cloudinary URL
    }

    const stew = await stewService.createStew(vendorId, stewData);

    res.status(201).json({
      message: "Stew created successfully",
      stew,
    });
  } catch (error) {
    console.error("Error in createStew controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// Get stews for a specific vendor
const getStewsByVendorId = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const stews = await stewService.getStewsByVendorId(vendorId);

    res.status(200).json({
      message: "Stews retrieved successfully",
      stews,
    });
  } catch (error) {
    console.error("Error in getStewsByVendorId controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// Update a stew
const updateStew = async (req, res) => {
  try {
    const { vendorId } = req.vendor;
    const { stewId } = req.params;
    const updateData = req.body;

    // If file was uploaded, upload to Cloudinary
    if (req.file) {
      const cloudinaryResponse = await cloudinaryUpload(req.file); // Upload the file to Cloudinary
      updateData.image = cloudinaryResponse.secure_url; // Save the Cloudinary URL
    }

    const stew = await stewService.updateStew(stewId, vendorId, updateData);

    res.status(200).json({
      message: "Stew updated successfully",
      stew,
    });
  } catch (error) {
    console.error("Error in updateStew controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// Delete a stew
const deleteStew = async (req, res) => {
  try {
    const { vendorId } = req.vendor;
    const { stewId } = req.params;

    const stew = await stewService.deleteStew(stewId, vendorId);

    res.status(200).json({
      message: "Stew deleted successfully",
      stew,
    });
  } catch (error) {
    console.error("Error in deleteStew controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// Make a stew unavailable
const makeStewUnavailable = async (req, res) => {
  try {
    const { vendorId } = req.vendor;
    const { stewId } = req.params;

    const stew = await stewService.makeStewUnavailable(stewId, vendorId);

    res.status(200).json({
      message: "Stew made unavailable successfully",
      stew,
    });
  } catch (error) {
    console.error("Error in makeStewUnavailable controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createStew,
  getStewsByVendorId,
  updateStew,
  deleteStew,
  makeStewUnavailable,
};
