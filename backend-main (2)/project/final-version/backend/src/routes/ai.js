const express = require("express");
const auth = require("../middleware/auth");
const { openAIJSON, fallbackWorkout } = require("../utils/aiProvider");

const router = express.Router();
router.use(auth);

// ✅ AI WORKOUT PLAN (new)
router.post("/workout", async (req, res, next) => {
  try {
    const { goal, level, daysPerWeek, minutesPerSession } = req.body || {};

    if (process.env.AI_PROVIDER === "openai" && process.env.OPENAI_API_KEY) {
      const prompt = `
You are a professional strength and conditioning coach.
Generate a realistic 8-week workout program for a ${level} lifter whose goal is ${goal}.
They train ${daysPerWeek} days per week, each session lasts ${minutesPerSession} minutes.

Return pure JSON in this structure:
{
  "split": string,
  "splitReason": string,
  "weeks": [
    {
      "weekNumber": number,
      "type": "build"|"deload"|"test",
      "days": [
        {
          "name": string,
          "exercises": [
            { "name": string, "sets": string, "reps": string, "rpe": string, "rest": string, "notes": string }
          ]
        }
      ]
    }
  ],
  "progression": string[],
  "deload": string[],
  "substitutions": { "exercise": string[] },
  "safetyNotes": string[]
}

Return ONLY pure JSON, no text or explanations.
      `.trim();

      try {
        let plan = await openAIJSON(prompt);
        if (typeof plan === "string") plan = JSON.parse(plan);
        return res.json({ provider: "openai", plan });
      } catch (e) {
        console.warn("OpenAI failed:", e.message);
      }
    }

    // fallback if AI fails
    const plan = fallbackWorkout({ goal, level, daysPerWeek, minutesPerSession });
    res.json({ provider: "fallback", plan });
  } catch (e) {
    next(e);
  }
});

// ✅ Nutrition Endpoint (unchanged — the same one you said works perfectly)
router.post("/nutrition", async (req, res, next) => {
  try {
    const { food } = req.body || {};

    if (!food || !food.trim()) {
      return res.status(400).json({ message: "Food description is required" });
    }

    if (process.env.AI_PROVIDER === "openai" && process.env.OPENAI_API_KEY) {
      const prompt = `
You are a certified nutrition expert.

Analyze ONLY the following food: "${food}"

Return strictly JSON in this structure:
{
  "targetCalories": number,
  "macros": {
    "protein": number,
    "carbs": number,
    "fat": number
  }
}

Rules:
- All numbers must be realistic and based on typical nutritional data.
- Values represent the TOTAL for the food quantity described.
- Do NOT include any explanations or text — return pure JSON only.
      `.trim();

      try {
        let plan = await openAIJSON(prompt);
        if (typeof plan === "string") plan = JSON.parse(plan);

        const calories = plan?.targetCalories || 0;
        const macros = plan?.macros || {};

        return res.json({
          provider: "openai",
          plan: {
            targetCalories: calories,
            macros: {
              protein: macros.protein || 0,
              carbs: macros.carbs || 0,
              fat: macros.fat || 0,
            },
          },
        });
      } catch (e) {
        console.warn("OpenAI failed:", e.message);
      }
    }

    // ✅ fallback in case AI fails
    const fallback = {
      targetCalories: 200,
      macros: { protein: 15, carbs: 10, fat: 8 },
    };
    res.json({ provider: "fallback", plan: fallback });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
