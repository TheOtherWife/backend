const vendorService = require("../../services/admin/vendorService");

exports.getAllVendors = async (req, res) => {
  try {
    const { searchQuery, status, cuisine, page = 1, limit = 10 } = req.query;
    const filters = { searchQuery, status, cuisine };

    const vendors = await vendorService.getAllVendors(
      filters,
      parseInt(page),
      parseInt(limit)
    );
    res.json({ success: true, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVendorById = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const vendor = await vendorService.getVendorById(vendorId);
    res.json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createVendor = async (req, res) => {
  try {
    const vendorData = req.body;
    const vendor = await vendorService.createVendor(vendorData);
    res.status(201).json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const updateData = req.body;

    const vendor = await vendorService.updateVendor(vendorId, updateData);
    res.json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateVendorStatus = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { status } = req.body;

    const vendor = await vendorService.updateVendorStatus(vendorId, status);
    res.json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const vendor = await vendorService.deleteVendor(vendorId);
    res.json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVendorStats = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const stats = await vendorService.getVendorStats(vendorId);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
