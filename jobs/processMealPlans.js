// jobs/processMealPlans.js
const cron = require("node-cron");
const mealPlanService = require("../services/mealPlanService");
const notificationService = require("../services/notificationService");

// Run every hour to check for meal plans that need processing
cron.schedule("0 * * * *", async () => {
  try {
    console.log("Checking for meal plans to process...");
    await mealPlanService.processScheduledMealPlans();
  } catch (error) {
    console.error("Error processing meal plans:", error);
  }
});

// Additional job for sending reminders (runs daily at 8 AM)
cron.schedule("0 8 * * *", async () => {
  try {
    console.log("Sending upcoming delivery reminders...");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const mealPlans = await MealPlan.find({
      active: true,
      nextDeliveryDate: {
        $gte: tomorrow,
        $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
      },
      "notificationPreferences.upcomingOrder": true,
    }).populate("userId");

    for (const mealPlan of mealPlans) {
      await notificationService.sendUpcomingDeliveryReminder(
        mealPlan.userId._id,
        mealPlan._id,
        mealPlan.name,
        mealPlan.nextDeliveryDate
      );
    }
  } catch (error) {
    console.error("Error sending reminders:", error);
  }
});

module.exports = cron;
