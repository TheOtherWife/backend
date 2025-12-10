const Settings = require("../../models/Settings");

class SettingsService {
  async getSettings() {
    try {
      let settings = await Settings.findOne();

      if (!settings) {
        // Create default settings if none exist
        settings = new Settings({
          appName: "The Other Wife",
          deliveryFee: 2.99,
          commissionRate: 15,
          supportEmail: "support@theotherwife.com",
          maintenanceMode: false,
        });
        await settings.save();
      }

      return settings;
    } catch (error) {
      throw error;
    }
  }

  async updateSettings(updateData) {
    try {
      let settings = await Settings.findOne();

      if (!settings) {
        settings = new Settings(updateData);
      } else {
        Object.assign(settings, updateData);
      }

      await settings.save();
      return settings;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new SettingsService();
