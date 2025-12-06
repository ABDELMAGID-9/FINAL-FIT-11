// backend/models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    // 👤 بيانات الحساب الأساسية
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },

    // 🏋️ مستواه في الجيم
    gymLevel:  { 
      type: String, 
      enum: ["beginner", "intermediate", "advanced"], 
      default: "beginner" 
    },

    // 🏅 نظام النقاط
    // points = الرصيد الحالي (المستخدم يشتري فيه جوائز / يظهر في الواجهة)
    points: { type: Number, default: 0 },

    // (اختياري لكن مفيد للـ Leaderboard لو حاب تطوره لاحقًا)
    // مجموع كل النقاط اللي حصل عليها طول عمره حتى لو صرف بعضها
    lifetimePoints: { type: Number, default: 0 },

    // 📊 إحصائيات الكميونتي (راح نحدّثها في posts.js)
    stats: {
      posts:         { type: Number, default: 0 }, // عدد البوستات اللي كتبها
      comments:      { type: Number, default: 0 }, // عدد التعليقات
      likesReceived: { type: Number, default: 0 }, // مجموع اللايكات اللي جاته
    },

    // 🎯 تقدّم التحديات (Challenge ID -> progress number)
    // مثلاً: { "1": 3, "3": 10 } يعني:
    // challenge 1 = تقدّم 3
    // challenge 3 = تقدّم 10
    challengeProgress: {
      type: Map,
      of: Number,
      default: {},
    },

    // ✅ قائمة الـ challenges اللي خلّصها بالكامل
    completedChallenges: {
      type: [String], // نستخدم نفس الـ id اللي في الـ frontend (مثلاً "1", "2", ...)
      default: [],
    },

    // 🖼 بيو و أفاتار
    avatar: { type: String, default: "" },
    bio:    { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
