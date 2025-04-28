// models/mealPlanModel.js
const mongoose = require("mongoose");

const additiveSelectionSchema = new mongoose.Schema(
  {
    additiveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Additive",
      required: true,
    },
    count: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const meatSelectionSchema = new mongoose.Schema(
  {
    meatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meat",
      required: true,
    },
    count: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const packageOptionSelectionSchema = new mongoose.Schema(
  {
    packageOptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PackageOption",
      required: true,
    },
    count: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const drinkSelectionSchema = new mongoose.Schema(
  {
    drinkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drink",
      required: true,
    },
    count: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const stewSelectionSchema = new mongoose.Schema(
  {
    stewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stew",
      required: true,
    },
    count: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const mealPlanItemSchema = new mongoose.Schema(
  {
    menuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    packageOptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PackageOption",
    },
    additives: [additiveSelectionSchema],
    drinks: [drinkSelectionSchema],
    meats: [meatSelectionSchema],
    stews: [stewSelectionSchema],
    quantity: { type: Number, default: 1, min: 1 },
    itemPrice: { type: Number, required: true },
    customizationNotes: String,
  },
  { _id: false }
);

const scheduleSchema = new mongoose.Schema(
  {
    frequency: {
      type: String,
      enum: ["daily", "weekly", "biweekly", "monthly", "custom"],
      required: true,
    },
    daysOfWeek: [
      {
        type: String,
        enum: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ],
        validate: {
          validator: function (v) {
            return this.frequency === "weekly" || this.frequency === "biweekly"
              ? v.length > 0
              : true;
          },
          message:
            "At least one day of week is required for weekly/biweekly schedules",
        },
      },
    ],
    specificDates: [
      {
        type: Date,
        validate: {
          validator: function (v) {
            return this.frequency === "custom" ? v.length > 0 : true;
          },
          message: "At least one date is required for custom schedules",
        },
      },
    ],
    startDate: { type: Date, required: true },
    endDate: Date,
    deliveryTime: {
      type: String,
      required: true,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
    },
  },
  { _id: false }
);

const mealPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    items: [mealPlanItemSchema],
    schedule: { type: scheduleSchema, required: true },
    deliveryAddress: {
      type: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, default: "Nigeria" },
        postalCode: { type: String },
        coordinates: {
          lat: { type: Number },
          lng: { type: Number },
        },
      },
      required: true,
    },
    contactPhone: { type: String, required: true },
    walletPayment: {
      isEnabled: { type: Boolean, default: true },
      minimumBalance: { type: Number, default: 0 },
    },
    notificationPreferences: {
      lowBalance: { type: Boolean, default: true },
      upcomingOrder: { type: Boolean, default: true },
      orderProcessed: { type: Boolean, default: true },
    },
    active: { type: Boolean, default: true },
    nextDeliveryDate: { type: Date },
    lastProcessed: { type: Date },
    failedAttempts: { type: Number, default: 0 },
    maxFailedAttempts: { type: Number, default: 3 },
  },
  { timestamps: true }
);

// Pre-save hook to calculate next delivery date
mealPlanSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("schedule")) {
    this.nextDeliveryDate = calculateNextDeliveryDate(this.schedule);
  }
  next();
});

// Helper function to calculate next delivery date
function calculateNextDeliveryDate(schedule) {
  const now = new Date();
  const today = new Date(now.setHours(0, 0, 0, 0));

  switch (schedule.frequency) {
    case "daily":
      return addDays(today, 1);

    case "weekly":
      return calculateNextWeeklyDate(today, schedule.daysOfWeek);

    case "biweekly":
      const nextDate = calculateNextWeeklyDate(today, schedule.daysOfWeek);
      // Check if this is the first or second week
      const weeksSinceStart = Math.floor(
        (today - schedule.startDate) / (7 * 24 * 60 * 60 * 1000)
      );
      return weeksSinceStart % 2 === 0 ? nextDate : addDays(nextDate, 7);

    case "monthly":
      return calculateNextMonthlyDate(today, schedule.startDate);

    case "custom":
      return findNextCustomDate(today, schedule.specificDates);

    default:
      return today;
  }
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function calculateNextWeeklyDate(today, daysOfWeek) {
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

  return addDays(today, daysToAdd);
}

function calculateNextMonthlyDate(today, startDate) {
  const nextDate = new Date(startDate);
  nextDate.setMonth(
    today.getMonth() + (today.getDate() >= startDate.getDate() ? 1 : 0)
  );
  return nextDate;
}

function findNextCustomDate(today, specificDates) {
  const futureDates = specificDates
    .map((d) => new Date(d))
    .filter((d) => d >= today)
    .sort((a, b) => a - b);

  return futureDates.length > 0 ? futureDates[0] : null;
}

module.exports = mongoose.model("MealPlan", mealPlanSchema);
