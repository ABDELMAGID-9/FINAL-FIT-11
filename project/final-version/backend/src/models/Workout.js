const mongoose = require("mongoose");

const ExerciseSchema = new mongoose.Schema({
  name: String,
  sets: String,
  reps: String,
  rpe: String,
  rest: String,
  notes: String,
}, { _id: false });

const WorkoutSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    title: { type: String, required: true },

    // ✅ بيانات خطة الـ AI بشكل واضح
    name: String, // اسم الخطة
    split: String, // نوع البرنامج (PPL, Upper/Lower, Full Body ...)
    goal: String, // الهدف (hypertrophy, strength ...)
    experience: String, // مستوى المستخدم
    daysPerWeek: Number, // عدد أيام التمرين بالأسبوع

    date: { type: Date, default: Date.now },
    exercises: [ExerciseSchema],
    notes: String,
    plan: mongoose.Schema.Types.Mixed, // الخطة الكاملة المتولدة من AI

    // ✅ احتياطي لحفظ بيانات واجهة المستخدم
    planData: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workout", WorkoutSchema);
