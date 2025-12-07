// src/App.tsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { MainLayout } from "./components/shared/MainLayout";
import { LoginScreen } from "./components/LoginScreen";
import { RegisterScreen } from "./components/RegisterScreen";
import { Dashboard } from "./components/Dashboard";
import { LandingPage } from "./components/LandingPage";
import { WorkoutDetails } from "./components/WorkoutDetails";
import { WorkoutForm } from "./components/WorkoutForm";
import { SettingsPage } from "./components/SettingsPage";
import { NotFoundPage } from "./components/NotFoundPage";
import { AIWorkoutBuilder } from "./components/AIWorkoutBuilder";
import { NutritionPlanner } from "./components/NutritionPlanner";
import { Leaderboard } from "./components/Leaderboard";
import { NoRepCounter } from "./components/NoRepCounter";
import { CommunityHub } from "./components/CommunityHub";
import { AudioLibrary } from "./components/AudioLibrary";

import { AuthProvider, useAuth } from "./hooks/useAuth";
import type { SavedWorkoutPlan } from "./types/workout";

// 🔐 حماية المسارات
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// 👇 المكوّن الداخلي
function AppInner() {
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    console.log("VITE_API_BASE =", import.meta.env.VITE_API_BASE);
  }, []);

  const [userPoints, setUserPoints] = useState(0);
  const [savedPlans, setSavedPlans] = useState<SavedWorkoutPlan[]>(() =>
    JSON.parse(localStorage.getItem("workoutPlans") || "[]")
  );
  const [leaderboardRank, setLeaderboardRank] = useState(0);

  const { logout } = useAuth();

  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const handleDeletePlan = (id: string) =>
    setSavedPlans((prev) => prev.filter((p) => p.id !== id));

  const handleLogout = () => {
    setUserPoints(0);
    logout();
  };

  return (
    <Routes>
      {/* صفحات عامة */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />

      {/* صفحات محمية */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout
              onLogout={handleLogout}
              isDarkMode={isDarkMode}
              onToggleTheme={toggleTheme}
            />
          </ProtectedRoute>
        }
      >
        <Route
          path="dashboard"
          element={
            <Dashboard
              onLogout={handleLogout}
              isDarkMode={isDarkMode}
              onToggleTheme={toggleTheme}
              savedPlans={savedPlans}
              onDeletePlan={handleDeletePlan}
              userPoints={userPoints}
              leaderboardRank={leaderboardRank}
              currentStreak={12}
            />
          }
        />
        <Route
          path="ai-builder"
          element={
            <AIWorkoutBuilder
              onLogout={handleLogout}
              savedPlans={savedPlans}
              onSavePlan={(p) => setSavedPlans([...savedPlans, p])}
            />
          }
        />
        <Route path="plan/:id" element={<WorkoutDetails onLogout={handleLogout} />} />
        <Route path="nutrition" element={<NutritionPlanner onLogout={handleLogout} />} />
        <Route
          path="leaderboard"
          element={
            <Leaderboard
              onLogout={handleLogout}
              userPoints={userPoints}
              onPointsUpdate={(p) => setUserPoints(p)}
              leaderboardRank={leaderboardRank}
            />
          }
        />
        <Route path="no-rep-counter" element={<NoRepCounter onLogout={handleLogout} />} />
        <Route
          path="community"
          element={
            <CommunityHub
              onLogout={handleLogout}
              userPoints={userPoints}
              onPointsUpdate={(p) => setUserPoints(p)}
            />
          }
        />
        <Route path="audio-library" element={<AudioLibrary onLogout={handleLogout} />} />
        <Route path="settings" element={<SettingsPage onLogout={handleLogout} />} />
        <Route path="workout-form" element={<WorkoutForm onLogout={handleLogout} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

// 👇 ملف الـApp الخارجي
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </Router>
  );
}
