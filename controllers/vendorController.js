const vendorService = require("../services/vendorService");

const registerVendor = async (req, res) => {
  try {
    const vendorData = req.body; // Extract the vendor data from the request body

    // Log the incoming request payload for debugging
    console.log("Incoming request payload:", vendorData);

    // Call the service to register the vendor
    const vendor = await vendorService.registerVendor(vendorData);

    res.status(201).json({
      message: "Vendor registered successfully",
      vendor,
    });
  } catch (error) {
    console.error("Error in registerVendor controller:", error.message); // Log the error
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
    const vendorId = req.vendor.vendorId; // Assuming vendorId is extracted from JWT
    const updateData = req.body;
    const vendor = await vendorService.updateProfile(vendorId, updateData);

    res.status(200).json({
      message: "Profile updated successfully",
      vendor,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
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
