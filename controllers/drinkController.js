const drinkService = require("../services/drinkService");
const { cloudinaryUpload } = require("../utils/cloudinary"); // Import the Cloudinary upload function

const createDrink = async (req, res) => {
  try {
    const { vendorId } = req.vendor;
    const drinkData = req.body;
    // If file was uploaded, upload to Cloudinary
    if (req.file) {
      const cloudinaryResponse = await cloudinaryUpload(req.file); // Upload the file to Cloudinary
      drinkData.image = cloudinaryResponse.secure_url; // Save the Cloudinary URL
    }

    const drink = await drinkService.createDrink(vendorId, drinkData);

    res.status(201).json({
      message: "Drink created successfully",
      drink,
    });
  } catch (error) {
    console.error("Error in createDrink controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

const getDrinksByVendorId = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const drinks = await drinkService.getDrinksByVendorId(vendorId);

    res.status(200).json({
      message: "Drinks retrieved successfully",
      drinks,
    });
  } catch (error) {
    console.error("Error in getDrinksByVendorId controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

const updateDrink = async (req, res) => {
  try {
    const { vendorId } = req.vendor;
    const { drinkId } = req.params;
    const updateData = req.body;

    // If file was uploaded, upload to Cloudinary
    if (req.file) {
      const cloudinaryResponse = await cloudinaryUpload(req.file); // Upload the file to Cloudinary
      updateData.image = cloudinaryResponse.secure_url; // Save the Cloudinary URL
    }

    const drink = await drinkService.updateDrink(drinkId, vendorId, updateData);

    res.status(200).json({
      message: "Drink updated successfully",
      drink,
    });
  } catch (error) {
    console.error("Error in updateDrink controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

const deleteDrink = async (req, res) => {
  try {
    const { vendorId } = req.vendor;
    const { drinkId } = req.params;

    const drink = await drinkService.deleteDrink(drinkId, vendorId);

    res.status(200).json({
      message: "Drink deleted successfully",
      drink,
    });
  } catch (error) {
    console.error("Error in deleteDrink controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

const makeDrinkUnavailable = async (req, res) => {
  try {
    const { vendorId } = req.vendor;
    const { drinkId } = req.params;

    const drink = await drinkService.makeDrinkUnavailable(drinkId, vendorId);

    res.status(200).json({
      message: "Drink made unavailable successfully",
      drink,
    });
  } catch (error) {
    console.error("Error in makeDrinkUnavailable controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createDrink,
  getDrinksByVendorId,
  updateDrink,
  deleteDrink,
  makeDrinkUnavailable,
};
