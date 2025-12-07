const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

// ✅ استدعاء OpenAI مباشرة باستخدام GPT-5-Nano
async function openAIJSON(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  const base = process.env.OPENAI_API_BASE || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-5-nano";
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
        { role: "system", content: "You are a professional fitness and nutrition assistant. Return pure JSON only." },
        { role: "user", content: prompt }
      ]
      // ❌ لا نستخدم temperature هنا لأن gpt-5-nano ما يدعمها
    }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`OpenAI error: ${res.status} ${t}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "{}";
  return JSON.parse(content);
}

// ✅ خطة تمرين افتراضية عند فشل الاتصال
function fallbackWorkout({ goal = "hypertrophy", level = "beginner", daysPerWeek = 4, minutesPerSession = 60 }) {
  const split = daysPerWeek <= 3 ? "Push-Pull-Legs (PPL)" : "Upper/Lower Split";
  const splitReason = daysPerWeek <= 3 ? "PPL يناسب 2-3 أيام أسبوعيًا لتوازن الحجم والتكرار." : "Upper/Lower مثالي 4 أيام بتكرار 2x.";
  const weeks = [];
  const dayNames = split.includes("Upper") ? ["Upper A","Lower A","Upper B","Lower B"] : ["Push","Pull","Legs","Full Body"];
  for (let i = 1; i <= 8; i++) {
    const type = i === 4 ? "deload" : (i === 8 && level === "advanced" ? "deload" : (i === 8 ? "test" : "build"));
    const days = [];
    for (let d = 0; d < Math.min(daysPerWeek, dayNames.length); d++) {
      days.push({
        name: dayNames[d],
        exercises: [
          { name:"Barbell Bench Press", sets:"3", reps:"6-8", rpe:"7-8", rest:"2-3 min", notes:"" },
          { name:"Row", sets:"3", reps:"8-10", rpe:"7-8", rest:"2 min", notes:"" },
          { name:"Squat or Leg Press", sets:"3", reps:"8-10", rpe:"7-8", rest:"2-3 min", notes:"" },
          { name:"Shoulder Press", sets:"2-3", reps:"8-12", rpe:"7-8", rest:"90 sec", notes:"" },
          { name:"Accessory", sets:"2-3", reps:"10-15", rpe:"7", rest:"60-90 sec", notes:"" }
        ]
      });
    }
    weeks.push({ weekNumber: i, type, days });
  }
  return {
    split, splitReason, weeks,
    progression: [
      "Double progression: إذا وصلت أعلى الرينج لكل المجموعات مع 2 RIR، زِد الوزن 2.5-5%.",
      "تتبّع التدريبات لتقييم التقدم.",
      "إن توقفت جلستين متتاليتين: قلل الحمل 10% وأعد البناء."
    ],
    deload: [
      "أسبوع deload كل 4 أسابيع أو عند الإرهاق: خفّض الحجم 40-50%.",
      "حافظ على RPE ≤ 6.",
      "ركّز على التقنية والحركة."
    ],
    substitutions: {
      "Barbell Bench Press":["Dumbbell Bench","Machine Chest Press","Weighted Push-ups"],
      "Back Squat":["Front Squat","Leg Press","Goblet Squat"],
      "Deadlift":["RDL","Trap Bar","Rack Pulls"]
    },
    safetyNotes: [
      "إحماء 5-8 دقائق + ramp sets قبل الرفع الأساسي.",
      "خفف الوزن عند كسر التقنية.",
      "أوقف التمرين عند ألم حاد."
    ]
  };
}

// ✅ خطة تغذية افتراضية عند فشل الاتصال
function fallbackNutrition({ goal="recomposition", weightKg=75, heightCm=175, age=24, sex="male", activity="moderate" }) {
  const s = sex==="male" ? 5 : -161;
  const bmr = (10*weightKg) + (6.25*heightCm) - (5*age) + s;
  const factor = { sedentary:1.2, light:1.375, moderate:1.55, active:1.725, athlete:1.9 }[activity] || 1.55;
  let tdee = Math.round(bmr * factor);
  let target = tdee;
  if (goal==="fat_loss") target -= 400;
  if (goal==="muscle_gain") target += 300;

  const protein = Math.round(weightKg * (goal==="muscle_gain" ? 2.0 : 1.8));
  const fat = Math.round((0.7 * weightKg));
  const proteinCal = protein * 4;
  const fatCal = fat * 9;
  const carbs = Math.max(0, Math.round((target - proteinCal - fatCal) / 4));

  const meals = [
    { name:"Breakfast", items:[{ item:"Oats + whey + banana", cals:400, p:30, c:60, f:8 }]},
    { name:"Lunch", items:[{ item:"Chicken, rice, veggies", cals:600, p:45, c:75, f:12 }]},
    { name:"Dinner", items:[{ item:"Beef, potatoes, salad", cals:650, p:40, c:70, f:20 }]},
    { name:"Snack", items:[{ item:"Greek yogurt + nuts", cals:250, p:20, c:15, f:10 }]}
  ];

  return {
    goal, targetCalories: target,
    macros: { protein, carbs, fat },
    reference: { bmr: Math.round(bmr), tdee },
    suggestions: [
      "وزّع البروتين على 3-5 وجبات يوميًا.",
      "اشرب 2-3 لتر ماء يوميًا.",
      "زد/قلل 150-200 سعرة أسبوعيًا بحسب الميزان."
    ],
    dayPlan: meals
  };
}

module.exports = { openAIJSON, fallbackWorkout, fallbackNutrition };
