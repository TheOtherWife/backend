const User = require("../../models/User");
const Order = require("../../models/orderModel");
const WalletTransaction = require("../../models/walletTransactionModel");

class UserService {
  async getAllUsers(filters = {}, page = 1, limit = 10) {
    try {
      const query = {};

      if (filters.searchQuery) {
        query.$or = [
          { firstName: { $regex: filters.searchQuery, $options: "i" } },
          { lastName: { $regex: filters.searchQuery, $options: "i" } },
          { email: { $regex: filters.searchQuery, $options: "i" } },
          { phoneNumber: { $regex: filters.searchQuery, $options: "i" } },
        ];
      }

      const options = {
        page,
        limit,
        sort: { createdAt: -1 },
      };

      const users = await User.paginate(query, options);
      return users;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async createUser(userData) {
    try {
      const user = new User(userData);
      await user.save();
      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(userId, updateData) {
    try {
      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserStats(userId) {
    try {
      const [totalOrders, walletBalance, recentTransactions] =
        await Promise.all([
          Order.countDocuments({ userId }),
          User.findById(userId).select("walletBalance"),
          WalletTransaction.find({ userId }).sort({ createdAt: -1 }).limit(5),
        ]);

      return {
        totalOrders,
        walletBalance: walletBalance ? walletBalance.walletBalance : 0,
        recentTransactions,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService();
