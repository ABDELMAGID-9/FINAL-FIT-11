// src/components/WorkoutDetails.tsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Dumbbell,
  ChevronDown,
  ChevronUp,
  Trash2,
  CheckCircle2,
  PartyPopper,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Separator } from "./ui/separator";
import { api } from "../lib/api";
import { TopBar } from "./shared/TopBar";
import { motion, AnimatePresence } from "framer-motion";

// 🔊 Base64 Audio

function playSound(path: string) {
  const audio = new Audio(path);
  audio.play().catch(err => console.log("Audio blocked:", err));
}

// استخدم WAV أو MP3
const CHECK_SOUND_SRC = "/sounds/mixkit-classic-click-1117.wav";
const SUCCESS_SOUND_SRC = "/sounds/success-340660.mp3";

// ⏱️ Rest timer state type
type RestTimerState = {
  remaining: number;
  isRunning: boolean;
};

// Helper to get rest seconds from exercise object
function getRestSeconds(ex: any): number {
  if (typeof ex?.restSeconds === "number") return ex.restSeconds;
  if (typeof ex?.rest === "number") return ex.rest;
  return 60; // default
}

export function WorkoutDetails({ onLogout }: { onLogout: () => void }) {
  const { id } = useParams();
  const navigate = useNavigate();

  // 🟦 Hooks — ALWAYS IN FIXED ORDER
  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState<any>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([]);
  const [completedKeys, setCompletedKeys] = useState<string[]>([]);
  const [showCongrats, setShowCongrats] = useState(false);
  const [restTimers, setRestTimers] = useState<
    Record<string, RestTimerState>
  >({});

  // 🌓 تحميل البيانات
  useEffect(() => {
    async function loadWorkout() {
      try {
        const res = await api<{ ok: boolean; workout: any }>(
          `/api/workouts/${id}`
        );
        if (res.ok) {
          setWorkout(res.workout);

          if (res.workout.planData?.weeks?.length > 0) {
            setExpandedWeeks([1]);
          }
        }
      } catch (err) {
        console.error("❌ Failed to load workout:", err);
      } finally {
        setLoading(false);
      }
    }
    loadWorkout();
  }, [id]);

  // 🧠 Hooks AFTER workout is loaded, لكن ثابتة دائمًا (useMemo لا يغيّر ترتيب)
  const allExerciseKeys = useMemo(() => {
    if (!workout) return [];

    const plan = workout.planData;
    const isAI = Array.isArray(plan.weeks);
    const keys: string[] = [];

    if (isAI) {
      plan.weeks.forEach((week: any) => {
        week.days.forEach((day: any, d: number) => {
          day.exercises.forEach((_: any, e: number) => {
            keys.push(`w${week.weekNumber}-d${d}-e${e}`);
          });
        });
      });
    } else {
      plan.exercises.forEach((_: any, e: number) => {
        keys.push(`m-0-e${e}`);
      });
    }

    return keys;
  }, [workout]);

  const totalExercises = allExerciseKeys.length;
  const completedCount = completedKeys.length;
  const progress =
    totalExercises === 0 ? 0 : Math.round((completedCount / totalExercises) * 100);

  // ⏱️ Global interval for all running rest timers
  useEffect(() => {
    const anyRunning = Object.values(restTimers).some((t) => t.isRunning);
    if (!anyRunning) return;

    const id = window.setInterval(() => {
      setRestTimers((prev) => {
        const next: typeof prev = { ...prev };
        let changed = false;

        Object.entries(prev).forEach(([key, timer]) => {
          if (!timer.isRunning) return;

          if (timer.remaining <= 1) {
            next[key] = { remaining: 0, isRunning: false };
            changed = true;
            // 🔔 Play sound when rest finishes
            playSound(SUCCESS_SOUND_SRC);
          } else {
            next[key] = {
              remaining: timer.remaining - 1,
              isRunning: true,
            };
            changed = true;
          }
        });

        return changed ? next : prev;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [restTimers]);

  // 🏁 Toggle Check
  const toggleCheck = (key: string) => {
    setCompletedKeys((prev) => {
      const exists = prev.includes(key);
      let next;

      if (exists) {
        next = prev.filter((k) => k !== key);
      } else {
        next = [...prev, key];
        playSound(CHECK_SOUND_SRC);

        if (next.length === totalExercises) {
          playSound(SUCCESS_SOUND_SRC);
          setShowCongrats(true);
        }
      }

      return next;
    });
  };

  // ⏱️ Start / Skip rest for a specific exercise
  const startRest = (key: string, restSeconds: number) => {
    setRestTimers((prev) => ({
      ...prev,
      [key]: { remaining: restSeconds, isRunning: true },
    }));
  };

  const skipRest = (key: string) => {
    setRestTimers((prev) => {
      const current = prev[key];
      if (!current) return prev;
      return {
        ...prev,
        [key]: { ...current, remaining: 0, isRunning: false },
      };
    });
  };

  const deletePlan = async () => {
    if (!window.confirm("Delete this plan?")) return;
    await api(`/api/workouts/${id}`, { method: "DELETE" });
    navigate("/dashboard");
  };

  // 🟥 LOADING / ERROR
  if (loading)
    return (
      <div className="h-screen flex justify-center items-center text-muted-foreground">
        Loading...
      </div>
    );

  if (!workout?.planData)
    return (
      <div className="h-screen flex justify-center items-center text-red-500">
        Workout not found
      </div>
    );

  const plan = workout.planData;
  const isAI = Array.isArray(plan.weeks);

  // 🟩 UI ثابت — لا يوجد ANY hook تحت conditions
  return (
    <div className="h-screen flex flex-col bg-background">
      <TopBar onLogout={onLogout} />

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* BACK BUTTON */}
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>

          {/* HEADER */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">
                {isAI ? plan.split : workout.title}
              </CardTitle>
              <CardDescription>
                {isAI ? plan.splitReason : plan.description}
              </CardDescription>

              {/* PROGRESS BAR */}
              {totalExercises > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>
                      {completedCount}/{totalExercises} · {progress}%
                    </span>
                  </div>

                  <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* DELETE */}
              <Button
                variant="destructive"
                className="mt-4"
                onClick={deletePlan}
              >
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            </CardHeader>
          </Card>

          {/* AI PLAN CHECKLIST */}
          {isAI && (
            <div className="space-y-4">
              {plan.weeks.map((week: any) => (
                <Card key={week.weekNumber} className="overflow-hidden">
                  <div
                    className="p-4 bg-muted/30 flex justify-between cursor-pointer"
                    onClick={() =>
                      setExpandedWeeks((prev) =>
                        prev.includes(week.weekNumber)
                          ? prev.filter((x) => x !== week.weekNumber)
                          : [...prev, week.weekNumber]
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                        {week.weekNumber}
                      </div>
                      <span className="font-semibold">Week {week.weekNumber}</span>
                    </div>

                    {expandedWeeks.includes(week.weekNumber) ? (
                      <ChevronUp />
                    ) : (
                      <ChevronDown />
                    )}
                  </div>

                  {expandedWeeks.includes(week.weekNumber) && (
                    <CardContent className="p-0">
                      {week.days.map((day: any, d: number) => (
                        <div key={d} className="p-4 space-y-2 border-t">
                          <h4 className="font-semibold text-primary flex items-center">
                            <Dumbbell className="w-3 h-3 mr-2" /> {day.name}
                          </h4>

                          {day.exercises.map((ex: any, e: number) => {
                            const key = `w${week.weekNumber}-d${d}-e${e}`;
                            const done = completedKeys.includes(key);
                            const restSeconds = getRestSeconds(ex);
                            const timer = restTimers[key];
                            const isRunning = timer?.isRunning ?? false;
                            const remaining =
                              timer?.remaining ?? restSeconds;

                            return (
                              <motion.button
                                key={key}
                                className={`w-full text-left p-3 rounded-lg border flex items-center gap-3 ${
                                  done
                                    ? "bg-emerald-50 border-emerald-200 dark:bg-green-900/20 dark:border-green-900/30"
                                    : "bg-background"
                                }`}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => toggleCheck(key)}
                              >
                                <CheckCircle2
                                  className={`w-5 h-5 ${
                                    done
  ? "text-green-600 dark:text-green-300"
  : "text-muted-foreground"

                                  }`}
                                />
                                <div className="flex flex-col gap-1">
                                  <div
                                    className={
                                      done
                                        ? "line-through text-muted-foreground"
                                        : ""
                                    }
                                  >
                                    {ex.name} — {ex.sets} sets / {ex.reps} reps
                                  </div>

                                  {/* ⏱️ Inline Rest Timer */}
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                    <span>Rest:</span>
                                    <span className="font-semibold text-primary">
                                      {remaining}s
                                    </span>

                                    <div
                                      className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted hover:bg-accent cursor-pointer text-[11px] uppercase tracking-widest select-none"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        startRest(key, restSeconds);
                                      }}
                                    >
                                      {isRunning ? "Restart" : "Start Rest"}
                                    </div>

                                    {isRunning && (
                                      <div
                                        className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive cursor-pointer select-none"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          skipRest(key);
                                        }}
                                      >
                                        Skip
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* MANUAL PLAN CHECKLIST */}
          {!isAI && (
            <Card>
              <CardHeader>
                <CardTitle>Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {workout.planData.exercises.map((ex: any, i: number) => {
                  const key = `m-0-e${i}`;
                  const done = completedKeys.includes(key);
                  const restSeconds = getRestSeconds(ex);
                  const timer = restTimers[key];
                  const isRunning = timer?.isRunning ?? false;
                  const remaining = timer?.remaining ?? restSeconds;

                  return (
                    <motion.button
                      key={key}
                      className={`w-full text-left p-3 rounded-lg border flex items-center gap-3 ${
                        done
  ? "bg-gradient-to-br from-green-400 via-green-500 to-green-600 text-white border-green-500 shadow-lg shadow-green-500/40 ring-2 ring-green-500"
  : "bg-card border-border hover:border-primary/40"

                      }`}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => toggleCheck(key)}
                    >
                      <CheckCircle2
                        className={`w-5 h-5 ${
                        done
  ? "text-green-600 dark:text-green-300"
  : "text-muted-foreground"

                        }`}
                      />
                      <div className="flex flex-col gap-1">
                        <div
                          className={
                            done
                              ? "line-through text-muted-foreground"
                              : ""
                          }
                        >
                          {ex.name} — {ex.sets} sets / {ex.reps} reps
                        </div>

                        {/* ⏱️ Inline Rest Timer */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>Rest:</span>
                          <span className="font-semibold text-primary">
                            {remaining}s
                          </span>

                          <div
                            className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted hover:bg-accent cursor-pointer text-[11px] uppercase tracking-widest select-none"
                            onClick={(event) => {
                              event.stopPropagation();
                              startRest(key, restSeconds);
                            }}
                          >
                            {isRunning ? "Restart" : "Start Rest"}
                          </div>

                          {isRunning && (
                            <div
                              className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive cursor-pointer select-none"
                              onClick={(event) => {
                                event.stopPropagation();
                                skipRest(key);
                              }}
                            >
                              Skip
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </CardContent>
            </Card>
          )}

          <Separator />
          <Button className="w-full" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </main>

      {/* 🎉 CONGRATS MODAL */}
      <AnimatePresence>
        {showCongrats && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="max-w-md w-full mx-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <Card className="p-6 text-center space-y-4">
                <PartyPopper className="w-16 h-16 text-primary mx-auto" />
                <h2 className="text-xl font-bold">🎉 Congratulations!</h2>
                <p className="text-muted-foreground">
                  You completed the entire workout. Amazing effort!
                </p>

                <Button
                  className="w-full"
                  onClick={() => {
                    setShowCongrats(false);
                    navigate("/dashboard");
                  }}
                >
                  Back to Dashboard
                </Button>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
