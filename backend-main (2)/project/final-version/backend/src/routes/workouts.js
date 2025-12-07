const express = require("express");
const Workout = require("../models/Workout");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

// GET all workouts
router.get("/", async (req, res, next) => {
  try {
    const workouts = await Workout.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ ok: true, workouts });
  } catch (e) {
    next(e);
  }
});

// CREATE workout (AI or Manual)
router.post("/", async (req, res, next) => {
  try {
    const {
      title,
      date,
      exercises,
      notes,
      plan,
      name,
      split,
      goal,
      experience,
      daysPerWeek,
      planData,

      // manual fields
      description,
      type,
      difficulty,
      duration
    } = req.body;

    const isManual = !plan && !planData;

    const newWorkout = await Workout.create({
      userId: req.user.id,
      title: title || name || "Workout",

      date: date || new Date(),

      manual: isManual,
      description: description || null,
      type: type || null,
      difficulty: difficulty || null,
      duration: duration || null,

      exercises: exercises || [],

      // AI only
      notes: notes || "",
      plan: isManual ? null : plan || null,
      planData: isManual
        ? { description, type, difficulty, duration, exercises }
        : planData || plan,

      name: name || split || "Workout",
      split,
      goal,
      experience,
      daysPerWeek
    });

    res.status(201).json({ ok: true, workout: newWorkout });
  } catch (e) {
    next(e);
  }
});

// GET one workout
router.get("/:id", async (req, res, next) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, userId: req.user.id });
    if (!workout) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true, workout });
  } catch (e) {
    next(e);
  }
});

// UPDATE workout
router.put("/:id", async (req, res, next) => {
  try {
    const updated = await Workout.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true, workout: updated });
  } catch (e) {
    next(e);
  }
});

// DELETE workout
router.delete("/:id", async (req, res, next) => {
  try {
    const result = await Workout.deleteOne({ _id: req.params.id, userId: req.user.id });
    res.json({ ok: true, deletedCount: result.deletedCount || 0 });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
