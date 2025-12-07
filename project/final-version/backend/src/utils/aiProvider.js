// backend/src/utils/aiProvider.js

// 🟢 استخدم fetch الأصلي في Node
const fetch = global.fetch;

// ==========================
// OPENAI — JSON Response
// ==========================
async function openAIJSON(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  const base = process.env.OPENAI_API_BASE || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-5-nano"; // خله كما هو لأنه شغّال عندك محلياً

  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are a fitness/nutrition assistant. Return ONLY pure JSON." },
        { role: "user", content: prompt }
      ]
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("OPENAI ERROR:", res.status, text);
    throw new Error(`OpenAI error: ${res.status}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "{}";

  return JSON.parse(content);
}


// ==========================
// FALLBACK WORKOUT
// ==========================
function fallbackWorkout({ goal = "hypertrophy", level = "beginner", daysPerWeek = 4, minutesPerSession = 60 }) {
  const split = daysPerWeek <= 3 ? "Push-Pull-Legs (PPL)" : "Upper/Lower Split";
  const splitReason = daysPerWeek <= 3 
    ? "PPL يناسب 2-3 أيام أسبوعيًا لتوازن الحجم." 
    : "Upper/Lower مثالي لـ 4 أيام أسبوعيًا.";

  const weeks = [];
  const dayNames = split.includes("Upper")
    ? ["Upper A", "Lower A", "Upper B", "Lower B"]
    : ["Push", "Pull", "Legs", "Full Body"];

  for (let i = 1; i <= 8; i++) {
    const type =
      i === 4 ? "deload"
      : i === 8 && level === "advanced" ? "deload"
      : i === 8 ? "test"
      : "build";

    const days = [];

    for (let d = 0; d < Math.min(daysPerWeek, dayNames.length); d++) {
      days.push({
        name: dayNames[d],
        exercises: [
          { name: "Bench Press", sets: "3", reps: "6-8", rpe: "7-8", rest: "2-3 min", notes: "" },
          { name: "Row", sets: "3", reps: "8-10", rpe: "7-8", rest: "2 min", notes: "" },
          { name: "Squat or Leg Press", sets: "3", reps: "8-10", rpe: "7-8", rest: "2-3 min", notes: "" },
          { name: "Shoulder Press", sets: "2-3", reps: "8-12", rpe: "7-8", rest: "90 sec", notes: "" }
        ]
      });
    }

    weeks.push({ weekNumber: i, type, days });
  }

  return {
    split,
    splitReason,
    weeks,
    progression: [
      "Increase load 2.5–5% when the top rep range is reached.",
      "Track sessions for accurate progression.",
      "Deload every 4 weeks or when fatigued."
    ],
    deload: ["Reduce volume 40–50%", "Lower RPE", "Focus on technique"],
    substitutions: {
      "Bench Press": ["DB Bench", "Machine Chest Press"],
      "Back Squat": ["Front Squat", "Leg Press"],
      "Deadlift": ["RDL", "Trap Bar"]
    },
    safetyNotes: ["Warm-up properly", "Maintain technique", "Stop on sharp pain"]
  };
}


// ==========================
// EXPORT
// ==========================
module.exports = { openAIJSON, fallbackWorkout };
