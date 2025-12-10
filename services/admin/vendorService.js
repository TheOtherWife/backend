const Vendor = require("../../models/Vendor");
const Order = require("../../models/orderModel");
const VendorTransaction = require("../../models/vendorTransactionModel");

class VendorService {
  async getAllVendors(filters = {}, page = 1, limit = 10) {
    try {
      const query = {};

      if (filters.searchQuery) {
        query.$or = [
          { firstName: { $regex: filters.searchQuery, $options: "i" } },
          { lastName: { $regex: filters.searchQuery, $options: "i" } },
          { displayName: { $regex: filters.searchQuery, $options: "i" } },
          { email: { $regex: filters.searchQuery, $options: "i" } },
          { phoneNumber: { $regex: filters.searchQuery, $options: "i" } },
        ];
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.cuisine) {
        query.cuisineSpecifications = filters.cuisine;
      }

      const options = {
        page,
        limit,
        sort: { createdAt: -1 },
      };

      const vendors = await Vendor.paginate(query, options);
      return vendors;
    } catch (error) {
      throw error;
    }
  }

  async getVendorById(vendorId) {
    try {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        throw new Error("Vendor not found");
      }
      return vendor;
    } catch (error) {
      throw error;
    }
  }

  async createVendor(vendorData) {
    try {
      const vendor = new Vendor(vendorData);
      await vendor.save();
      return vendor;
    } catch (error) {
      throw error;
    }
  }

  async updateVendor(vendorId, updateData) {
    try {
      const vendor = await Vendor.findByIdAndUpdate(vendorId, updateData, {
        new: true,
        runValidators: true,
      });

      if (!vendor) {
        throw new Error("Vendor not found");
      }

      return vendor;
    } catch (error) {
      throw error;
    }
  }

  async updateVendorStatus(vendorId, status) {
    try {
      const validStatuses = ["active", "pending", "suspended"];
      if (!validStatuses.includes(status)) {
        throw new Error("Invalid status");
      }

      const vendor = await Vendor.findByIdAndUpdate(
        vendorId,
        { status },
        { new: true }
      );

      if (!vendor) {
        throw new Error("Vendor not found");
      }

      return vendor;
    } catch (error) {
      throw error;
    }
  }

  async deleteVendor(vendorId) {
    try {
      const vendor = await Vendor.findByIdAndDelete(vendorId);
      if (!vendor) {
        throw new Error("Vendor not found");
      }
      return vendor;
    } catch (error) {
      throw error;
    }
  }

  async getVendorStats(vendorId) {
    try {
      const [totalOrders, totalRevenue, recentTransactions] = await Promise.all(
        [
          Order.countDocuments({ vendorId }),
          VendorTransaction.aggregate([
            {
              $match: {
                vendorId: mongoose.Types.ObjectId(vendorId),
                status: "completed",
              },
            },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]),
          VendorTransaction.find({ vendorId }).sort({ createdAt: -1 }).limit(5),
        ]
      );

      return {
        totalOrders,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        recentTransactions,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new VendorService();
