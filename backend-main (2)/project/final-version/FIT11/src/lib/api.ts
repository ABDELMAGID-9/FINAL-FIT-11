// src/lib/api.ts

export const API_BASE =
  (import.meta as any).env?.VITE_API_BASE || "http://localhost:3000";

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = text;
    try {
      const j = JSON.parse(text);
      message = j.message || text;
    } catch {}
    throw new Error(message || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

/* ============================
      AUTH
============================= */

export function login(email: string, password: string) {
  return api<{ token: string; user: any }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function registerUser(payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gymLevel: string;
}) {
  return api<{ token: string; user: any }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function me() {
  return api<{ user: any }>("/api/auth/me");
}

/* ============================
      UPDATE POINTS
============================= */

export function updateUserPoints(delta: number) {
  return api<{ ok: boolean; points: number }>("/api/auth/points", {
    method: "PUT",
    body: JSON.stringify({ delta }),
  });
}

/* ============================
      AI WORKOUT API
============================= */

export function aiWorkout(payload: {
  goal: string;
  level: string;
  daysPerWeek: number;
  minutesPerSession: number;
}) {
  return api<{ provider: string; plan: any }>("/api/ai/workout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ============================
      WORKOUTS
============================= */

export function saveWorkout(payload: { title?: string; plan: any }) {
  return api<{ ok: true; workout: any }>("/api/workouts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMyWorkouts() {
  return api<{ ok: true; workouts: any[] }>("/api/workouts");
}

export function deleteWorkout(id: string) {
  return api<{ ok: true }>(`/api/workouts/${id}`, { method: "DELETE" });
}

/* ============================
      NUTRITION
============================= */

export function addNutritionLog(payload: {
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  at?: string;
}) {
  return api<{ ok: true; log: any }>("/api/nutrition/logs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getNutritionLogs() {
  return api<{ ok: true; logs: any[] }>("/api/nutrition/logs");
}

export function deleteNutritionLog(id: string) {
  return api<{ ok: true }>(`/api/nutrition/logs/${id}`, {
    method: "DELETE",
  });
}

/* ============================
      PROFILE / SETTINGS
============================= */

export function updateMe(payload: {
  firstName?: string;
  lastName?: string;
  email?: string;
  gymLevel?: string;
  bio?: string;
  avatar?: string;
}) {
  return api<{ ok: boolean; user: any }>("/api/auth/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
