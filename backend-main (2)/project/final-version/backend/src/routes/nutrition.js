const express = require("express");
const auth = require("../middleware/auth");
const NutritionLog = require("../models/NutritionLog");

const router = express.Router();

// 🧩 جميع العمليات تتطلب تسجيل دخول
router.use(auth);

/**
 * 🥗 POST /api/nutrition/logs
 * إضافة وجبة جديدة للمستخدم
 */
router.post("/logs", async (req, res, next) => {
  try {
    const { description, calories, protein, carbs, fat, at } = req.body || {};

    if (!description || !calories)
      return res.status(400).json({ message: "description and calories are required" });

    const log = await NutritionLog.create({
      userId: req.user.id,
      goal: "custom", // يمكنك تغييره إذا كنت تستخدم أهداف مختلفة
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      plan: { description, at: at || new Date() },
    });

    res.status(201).json({ ok: true, log });
  } catch (e) {
    console.error("❌ Error saving nutrition log:", e);
    next(e);
  }
});

/**
 * 🧩 GET /api/nutrition/logs
 * جلب جميع وجبات المستخدم بترتيب تنازلي
 */
router.get("/logs", async (req, res, next) => {
  try {
    const logs = await NutritionLog.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({ ok: true, logs });
  } catch (e) {
    console.error("❌ Error fetching nutrition logs:", e);
    next(e);
  }
});

/**
 * 🧩 DELETE /api/nutrition/logs/:id
 * حذف وجبة معينة
 */
router.delete("/logs/:id", async (req, res, next) => {
  try {
    const result = await NutritionLog.deleteOne({ _id: req.params.id, userId: req.user.id });
    if (result.deletedCount === 0)
      return res.status(404).json({ message: "Log not found" });

    res.json({ ok: true });
  } catch (e) {
    console.error("❌ Error deleting nutrition log:", e);
    next(e);
  }
});

module.exports = router;
