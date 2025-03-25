const Drink = require("../models/drinkModel");

const createDrink = async (vendorId, drinkData) => {
  try {
    const drink = new Drink({ ...drinkData, vendorId });
    await drink.save();
    return drink;
  } catch (error) {
    console.error("Error in createDrink service:", error.message);
    throw error;
  }
};

const getDrinksByVendorId = async (vendorId) => {
  try {
    const drinks = await Drink.find({ vendorId });
    return drinks;
  } catch (error) {
    console.error("Error in getDrinksByVendorId service:", error.message);
    throw error;
  }
};

const updateDrink = async (drinkId, vendorId, updateData) => {
  try {
    const drink = await Drink.findOneAndUpdate(
      { _id: drinkId, vendorId },
      updateData,
      { new: true }
    );

    if (!drink) {
      throw new Error("Drink not found or unauthorized");
    }

    return drink;
  } catch (error) {
    console.error("Error in updateDrink service:", error.message);
    throw error;
  }
};

const deleteDrink = async (drinkId, vendorId) => {
  try {
    const drink = await Drink.findOneAndDelete({ _id: drinkId, vendorId });

    if (!drink) {
      throw new Error("Drink not found or unauthorized");
    }

    return drink;
  } catch (error) {
    console.error("Error in deleteDrink service:", error.message);
    throw error;
  }
};

const makeDrinkUnavailable = async (drinkId, vendorId) => {
  try {
    const drink = await Drink.findOneAndUpdate(
      { _id: drinkId, vendorId },
      { isAvailable: false },
      { new: true }
    );

    if (!drink) {
      throw new Error("Drink not found or unauthorized");
    }

    return drink;
  } catch (error) {
    console.error("Error in makeDrinkUnavailable service:", error.message);
    throw error;
  }
};

module.exports = {
  createDrink,
  getDrinksByVendorId,
  updateDrink,
  deleteDrink,
  makeDrinkUnavailable,
};
