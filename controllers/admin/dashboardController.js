const dashboardService = require("../../services/admin/dashboardService");

exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSalesData = async (req, res) => {
  try {
    const { timeRange } = req.query;
    const salesData = await dashboardService.getSalesData(timeRange);
    res.json({ success: true, data: salesData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderStatusData = async (req, res) => {
  try {
    const statusData = await dashboardService.getOrderStatusData();
    res.json({ success: true, data: statusData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
