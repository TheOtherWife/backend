const vendorWalletService = require("../services/vendorWalletService");
const cron = require("node-cron");

// Run every day at 11:30 PM
cron.schedule("30 23 * * *", async () => {
  try {
    console.log("Starting daily vendor payouts...");
    const results = await vendorWalletService.processDailyPayouts();
    console.log(`Completed payouts for ${results.length} vendors`);
  } catch (error) {
    console.error("Error processing daily payouts:", error);
  }
});

module.exports = cron;
