const mongoose = require("mongoose");

const NutritionLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    date:   { type: Date, default: Date.now },
    goal:   { 
      type: String, 
      enum: ["fat_loss","recomposition","muscle_gain","maintenance","custom"], 
      default: "maintenance" 
    },
    calories: Number,
    protein:  Number,
    carbs:    Number,
    fat:      Number,
    plan:     mongoose.Schema.Types.Mixed // خطة الوجبات اليومية المتولدة
  },
  { timestamps: true }
);

module.exports = mongoose.model("NutritionLog", NutritionLogSchema);
