// services/mealPlanService.js
const MealPlan = require("../models/mealPlanModel");
const Order = require("../models/orderModel");
const User = require("../models/User");
const Menu = require("../models/menuModel");
const PackageOption = require("../models/packageModel");
const Additive = require("../models/additiveModel");
const Meat = require("../models/meatModel");
const Drink = require("../models/drinkModel");
const Stew = require("../models/stewModel");
const { v4: uuidv4 } = require("uuid");
const notificationService = require("./notificationService");
const walletService = require("./walletService");

class MealPlanService {
  // Create a new meal plan with comprehensive validation
  async createMealPlan(userId, mealPlanData) {
    // Calculate total price with counts
    const totalPrice = await this.calculateTotalPriceWithCounts(
      mealPlanData.items
    );

    // Verify wallet balance
    const walletBalance = await walletService.getWalletBalance(userId);
    if (walletBalance.balance < totalPrice) {
      throw new Error(
        `Insufficient wallet balance. Needed: ₦${totalPrice.toFixed(
          2
        )}, Available: ₦${walletBalance.balance.toFixed(2)}`
      );
    }

    // Calculate first delivery date
    const nextDeliveryDate = this.calculateNextDeliveryDate(
      mealPlanData.schedule
    );

    const mealPlan = new MealPlan({
      userId,
      ...mealPlanData,
      nextDeliveryDate,
      walletPayment: {
        isEnabled: true,
        minimumBalance: totalPrice,
      },
    });

    return await mealPlan.save();
  }

  // Process scheduled meal plans with count support
  async processScheduledMealPlans() {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));

    // Find meal plans due for processing
    const mealPlans = await MealPlan.find({
      nextDeliveryDate: { $lte: today },
      active: true,
      failedAttempts: { $lt: 3 }, // Max 3 failed attempts
    }).populate("userId", "email phoneNumber");

    for (const mealPlan of mealPlans) {
      try {
        // Calculate total with counts
        const totalPrice = await this.calculateTotalPriceWithCounts(
          mealPlan.items
        );
        const walletBalance = await walletService.getWalletBalance(
          mealPlan.userId._id
        );

        // Check wallet balance
        if (walletBalance.balance < totalPrice) {
          await this.handleInsufficientBalance(
            mealPlan,
            totalPrice,
            walletBalance.balance
          );
          continue;
        }

        // Create order with count support
        const order = await this.createOrderFromMealPlanWithCounts(mealPlan);

        // Process payment
        await walletService.debitWallet(
          mealPlan.userId._id,
          totalPrice,
          `Scheduled order from meal plan: ${mealPlan.name}`,
          order._id.toString()
        );

        // Update meal plan schedule
        mealPlan.lastProcessed = new Date();
        mealPlan.nextDeliveryDate = this.calculateNextDeliveryDate(
          mealPlan.schedule
        );
        mealPlan.failedAttempts = 0;

        // Check for end date
        if (mealPlan.schedule.endDate && mealPlan.schedule.endDate <= today) {
          mealPlan.active = false;
        }

        await mealPlan.save();

        // Send confirmation
        if (mealPlan.notificationPreferences?.orderProcessed) {
          await notificationService.sendOrderConfirmation(
            mealPlan.userId,
            order._id,
            mealPlan.name
          );
        }
      } catch (error) {
        console.error(`Failed to process meal plan ${mealPlan._id}:`, error);
        await this.handleProcessingError(mealPlan, error);
      }
    }
  }

  // Create order with count support for additives/meats/etc
  async createOrderFromMealPlanWithCounts(mealPlan) {
    const orderItems = await Promise.all(
      mealPlan.items.map(async (item) => {
        const menuItem = await Menu.findById(item.menuId);
        if (!menuItem) throw new Error(`Menu item ${item.menuId} not found`);

        // Process additives with counts
        const additives = await Promise.all(
          item.additives.map(async (additive) => {
            const additiveDoc = await Additive.findById(additive.additiveId);
            return {
              id: additive.additiveId,
              name: additiveDoc.name,
              price: additiveDoc.price,
              count: additive.count || 1,
            };
          })
        );

        // Process meats with counts
        const meats = await Promise.all(
          item.meats.map(async (meat) => {
            const meatDoc = await Meat.findById(meat.meatId);
            return {
              id: meat.meatId,
              name: meatDoc.name,
              price: meatDoc.price,
              count: meat.count || 1,
            };
          })
        );

        // Process drinks with counts
        const drinks = await Promise.all(
          item.drinks.map(async (drink) => {
            const drinkDoc = await Drink.findById(drink.drinkId);
            return {
              id: drink.drinkId,
              name: drinkDoc.name,
              price: drinkDoc.price,
              count: drink.count || 1,
            };
          })
        );

        // Process stews with counts
        const stews = await Promise.all(
          item.stews.map(async (stew) => {
            const stewDoc = await Stew.findById(stew.stewId);
            return {
              id: stew.stewId,
              name: stewDoc.name,
              price: stewDoc.price,
              count: stew.count || 1,
            };
          })
        );

        // Process package option if exists
        let packageOption = null;
        if (item.packageOptionId) {
          const packageDoc = await PackageOption.findById(item.packageOptionId);
          packageOption = {
            id: packageDoc._id,
            name: packageDoc.name,
            price: packageDoc.price,
          };
        }

        return {
          menuId: item.menuId,
          name: menuItem.name,
          packageOption,
          additives,
          meats,
          drinks,
          stews,
          quantity: item.quantity,
          itemPrice: await this.calculateItemPriceWithCounts(item),
          customizationNotes: item.customizationNotes,
        };
      })
    );

    // Calculate totals
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.itemPrice * item.quantity,
      0
    );
    const total = subtotal + (mealPlan.deliveryFee || 0);

    // Create and save order
    const order = new Order({
      userId: mealPlan.userId._id,
      vendorId: mealPlan.items[0].vendorId,
      items: orderItems,
      subtotal,
      deliveryFee: mealPlan.deliveryFee || 0,
      tax: 0,
      total,
      deliveryAddress: mealPlan.deliveryAddress,
      contactPhone: mealPlan.contactPhone,
      payment: {
        method: "wallet",
        status: "completed",
        amount: total,
        transactionId: uuidv4(),
      },
      status: "confirmed",
      estimatedDeliveryTime: this.getDeliveryDateTime(mealPlan),
      isScheduledOrder: true,
      mealPlanId: mealPlan._id,
    });

    return await order.save();
  }

  // Calculate item price with counts
  async calculateItemPriceWithCounts(item) {
    let price = 0;

    // Get base menu price
    const menuItem = await Menu.findById(item.menuId);
    if (!menuItem) throw new Error(`Menu item ${item.menuId} not found`);
    price += menuItem.basePrice;

    // Add package option price
    if (item.packageOptionId) {
      const packageOption = await PackageOption.findById(item.packageOptionId);
      if (packageOption) price += packageOption.price;
    }

    // Add additives prices with counts
    if (item.additives && item.additives.length > 0) {
      const additivePrices = await Additive.find({
        _id: { $in: item.additives.map((a) => a.additiveId) },
      });

      const additiveMap = new Map(
        additivePrices.map((a) => [a._id.toString(), a.price])
      );

      price += item.additives.reduce((sum, additive) => {
        return (
          sum +
          additiveMap.get(additive.additiveId.toString()) *
            (additive.count || 1)
        );
      }, 0);
    }

    // Add meats prices with counts
    if (item.meats && item.meats.length > 0) {
      const meatPrices = await Meat.find({
        _id: { $in: item.meats.map((m) => m.meatId) },
      });

      const meatMap = new Map(
        meatPrices.map((m) => [m._id.toString(), m.price])
      );

      price += item.meats.reduce((sum, meat) => {
        return sum + meatMap.get(meat.meatId.toString()) * (meat.count || 1);
      }, 0);
    }

    // Similar for drinks and stews...

    return price;
  }

  // Calculate total price for all items with counts
  async calculateTotalPriceWithCounts(items) {
    let total = 0;

    for (const item of items) {
      const itemPrice = await this.calculateItemPriceWithCounts(item);
      total += itemPrice * item.quantity;
    }

    return total;
  }

  // Handle insufficient wallet balance
  async handleInsufficientBalance(mealPlan, requiredAmount, currentBalance) {
    mealPlan.failedAttempts = (mealPlan.failedAttempts || 0) + 1;

    // Send notification if enabled
    if (mealPlan.notificationPreferences?.lowBalance) {
      await notificationService.sendLowBalanceAlert(
        mealPlan.userId,
        mealPlan._id,
        mealPlan.name,
        requiredAmount,
        currentBalance
      );
    }

    // Deactivate if max attempts reached
    if (mealPlan.failedAttempts >= 3) {
      mealPlan.active = false;
      await notificationService.sendMealPlanDeactivated(
        mealPlan.userId,
        mealPlan._id,
        mealPlan.name
      );
    }

    await mealPlan.save();
  }

  // Handle processing errors
  async handleProcessingError(mealPlan, error) {
    mealPlan.failedAttempts = (mealPlan.failedAttempts || 0) + 1;

    // Deactivate if max attempts reached
    if (mealPlan.failedAttempts >= 3) {
      mealPlan.active = false;
      await notificationService.sendMealPlanDeactivated(
        mealPlan.userId,
        mealPlan._id,
        mealPlan.name,
        error.message
      );
    }

    await mealPlan.save();
  }

  // Calculate next delivery date based on schedule
  calculateNextDeliveryDate(schedule) {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));

    switch (schedule.frequency) {
      case "daily":
        return new Date(today.setDate(today.getDate() + 1));

      case "weekly":
        return this.calculateNextWeeklyDate(today, schedule.daysOfWeek);

      case "biweekly":
        const nextWeekly = this.calculateNextWeeklyDate(
          today,
          schedule.daysOfWeek
        );
        const weeksSinceStart = Math.floor(
          (today - schedule.startDate) / (7 * 24 * 60 * 60 * 1000)
        );
        return new Date(
          nextWeekly.setDate(
            nextWeekly.getDate() + (weeksSinceStart % 2 === 0 ? 0 : 7)
          )
        );

      case "monthly":
        return this.calculateNextMonthlyDate(today, schedule.startDate);

      case "custom":
        return this.findNextCustomDate(today, schedule.specificDates);

      default:
        return today;
    }
  }

  // Helper to calculate next weekly date
  calculateNextWeeklyDate(today, daysOfWeek) {
    const currentDay = today.getDay();
    const dayNumbers = daysOfWeek.map((day) =>
      [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ].indexOf(day.toLowerCase())
    );

    const nextDay = dayNumbers.find((day) => day > currentDay) || dayNumbers[0];
    const daysToAdd =
      nextDay > currentDay ? nextDay - currentDay : 7 - currentDay + nextDay;

    return new Date(today.setDate(today.getDate() + daysToAdd));
  }

  // Helper to calculate next monthly date
  calculateNextMonthlyDate(today, startDate) {
    const nextDate = new Date(startDate);
    nextDate.setMonth(
      today.getMonth() + (today.getDate() >= startDate.getDate() ? 1 : 0)
    );
    return nextDate;
  }

  // Helper to find next custom date
  findNextCustomDate(today, specificDates) {
    const futureDates = specificDates
      .map((d) => new Date(d))
      .filter((d) => d >= today)
      .sort((a, b) => a - b);

    return futureDates.length > 0 ? futureDates[0] : null;
  }

  // Get delivery date and time
  getDeliveryDateTime(mealPlan) {
    const [hours, minutes] = mealPlan.schedule.deliveryTime.split(":");
    const deliveryDate = new Date(mealPlan.nextDeliveryDate);
    deliveryDate.setHours(parseInt(hours), parseInt(minutes));
    return deliveryDate;
  }

  // Get all meal plans for user
  async getUserMealPlans(userId) {
    return await MealPlan.find({ userId })
      .sort({ nextDeliveryDate: 1 })
      .populate("items.menuId", "name image")
      .populate("items.vendorId", "name");
  }

  // Get specific meal plan
  async getMealPlan(userId, mealPlanId) {
    return await MealPlan.findOne({ _id: mealPlanId, userId })
      .populate("items.menuId", "name image")
      .populate("items.vendorId", "name")
      .populate("items.packageOptionId", "name price")
      .populate("items.additives.additiveId", "name price")
      .populate("items.meats.meatId", "name price")
      .populate("items.drinks.drinkId", "name price")
      .populate("items.stews.stewId", "name price");
  }

  // Update meal plan
  async updateMealPlan(userId, mealPlanId, updateData) {
    const mealPlan = await MealPlan.findOneAndUpdate(
      { _id: mealPlanId, userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!mealPlan) throw new Error("Meal plan not found");

    // Recalculate next delivery date if schedule changed
    if (updateData.schedule) {
      mealPlan.nextDeliveryDate = this.calculateNextDeliveryDate(
        mealPlan.schedule
      );
      await mealPlan.save();
    }

    return mealPlan;
  }

  // Pause meal plan
  async pauseMealPlan(userId, mealPlanId) {
    return await this.updateMealPlan(userId, mealPlanId, { active: false });
  }

  // Resume meal plan
  async resumeMealPlan(userId, mealPlanId) {
    const mealPlan = await this.updateMealPlan(userId, mealPlanId, {
      active: true,
    });

    // Reset next delivery date if it's in the past
    if (!mealPlan.nextDeliveryDate || mealPlan.nextDeliveryDate < new Date()) {
      mealPlan.nextDeliveryDate = this.calculateNextDeliveryDate(
        mealPlan.schedule
      );
      await mealPlan.save();
    }

    return mealPlan;
  }

  // Cancel meal plan
  async cancelMealPlan(userId, mealPlanId) {
    return await MealPlan.findOneAndUpdate(
      { _id: mealPlanId, userId },
      { active: false, cancelledAt: new Date() },
      { new: true }
    );
  }
}

module.exports = new MealPlanService();
