// services/notificationService.js
const User = require("../models/User");
const emailService = require("./emailService");
const smsService = require("./smsService");

class NotificationService {
  async sendLowBalanceAlert(
    userId,
    mealPlanId,
    mealPlanName,
    requiredAmount,
    currentBalance
  ) {
    const user = await User.findById(userId);
    if (!user) return;

    const message = `Your meal plan "${mealPlanName}" requires ₦${requiredAmount.toFixed(
      2
    )} but your wallet balance is ₦${currentBalance.toFixed(
      2
    )}. Please fund your wallet to avoid interruption.`;

    // Send email
    if (user.email) {
      await emailService.send({
        to: user.email,
        subject: "Low Wallet Balance Alert",
        text: message,
        html: `<p>${message}</p>`,
      });
    }

    // Send SMS
    if (user.phoneNumber) {
      await smsService.send(user.phoneNumber, message);
    }
  }

  async sendOrderConfirmation(userId, orderId, mealPlanName) {
    const user = await User.findById(userId);
    if (!user) return;

    const message = `Your scheduled order from "${mealPlanName}" has been processed successfully. Order ID: ${orderId}`;

    if (user.email) {
      await emailService.send({
        to: user.email,
        subject: "Scheduled Order Processed",
        text: message,
      });
    }

    if (user.phoneNumber) {
      await smsService.send(user.phoneNumber, message);
    }
  }

  async sendMealPlanDeactivated(userId, mealPlanId, mealPlanName) {
    const user = await User.findById(userId);
    if (!user) return;

    const message = `Your meal plan "${mealPlanName}" has been deactivated due to multiple failed attempts. Please update your payment method or contact support.`;

    if (user.email) {
      await emailService.send({
        to: user.email,
        subject: "Meal Plan Deactivated",
        text: message,
      });
    }

    if (user.phoneNumber) {
      await smsService.send(user.phoneNumber, message);
    }
  }

  async sendUpcomingDeliveryReminder(
    userId,
    mealPlanId,
    mealPlanName,
    deliveryDate
  ) {
    const user = await User.findById(userId);
    if (!user) return;

    const message = `Reminder: Your "${mealPlanName}" delivery is scheduled for ${deliveryDate.toLocaleDateString()} at ${deliveryDate.toLocaleTimeString()}.`;

    if (user.email) {
      await emailService.send({
        to: user.email,
        subject: "Upcoming Meal Delivery",
        text: message,
      });
    }

    if (user.phoneNumber) {
      await smsService.send(user.phoneNumber, message);
    }
  }
}

module.exports = new NotificationService();
