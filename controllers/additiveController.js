const additiveService = require("../services/additiveService");

const createAdditive = async (req, res) => {
  try {
    const { vendorId } = req.vendor;
    const additiveData = req.body;

    const additive = await additiveService.createAdditive(
      vendorId,
      additiveData
    );

    res.status(201).json({
      message: "Additive created successfully",
      additive,
    });
  } catch (error) {
    console.error("Error in createAdditive controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

const getAdditivesByVendorId = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const additives = await additiveService.getAdditivesByVendorId(vendorId);

    res.status(200).json({
      message: "Additives retrieved successfully",
      additives,
    });
  } catch (error) {
    console.error("Error in getAdditivesByVendorId controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

const updateAdditive = async (req, res) => {
  try {
    const { vendorId } = req.vendor;
    const { additiveId } = req.params;
    const updateData = req.body;

    const additive = await additiveService.updateAdditive(
      additiveId,
      vendorId,
      updateData
    );

    res.status(200).json({
      message: "Additive updated successfully",
      additive,
    });
  } catch (error) {
    console.error("Error in updateAdditive controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

const deleteAdditive = async (req, res) => {
  try {
    const { vendorId } = req.vendor;
    const { additiveId } = req.params;

    const additive = await additiveService.deleteAdditive(additiveId, vendorId);

    res.status(200).json({
      message: "Additive deleted successfully",
      additive,
    });
  } catch (error) {
    console.error("Error in deleteAdditive controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

const makeAdditiveUnavailable = async (req, res) => {
  try {
    const { vendorId } = req.vendor;
    const { additiveId } = req.params;

    const additive = await additiveService.makeAdditiveUnavailable(
      additiveId,
      vendorId
    );

    res.status(200).json({
      message: "Additive made unavailable successfully",
      additive,
    });
  } catch (error) {
    console.error(
      "Error in makeAdditiveUnavailable controller:",
      error.message
    );
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createAdditive,
  getAdditivesByVendorId,
  updateAdditive,
  deleteAdditive,
  makeAdditiveUnavailable,
};
