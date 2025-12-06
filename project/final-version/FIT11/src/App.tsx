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



// ✅ مكون حماية المسارات
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
const [userPoints, setUserPoints] = useState(0);
  const [savedPlans, setSavedPlans] = useState<SavedWorkoutPlan[]>(() => JSON.parse(localStorage.getItem("workoutPlans") || "[]"));
  const [leaderboardRank, setLeaderboardRank] = useState(0);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const handlePointsUpdate = (points: number) => setUserPoints(points);
  const handleSavePlan = (plan: SavedWorkoutPlan) => setSavedPlans(prev => [...prev, plan]);
  const handleDeletePlan = (planId: string) => setSavedPlans(prev => prev.filter(p => p.id !== planId));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);


  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* صفحات عامة */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />

          {/* صفحات محمية داخل الـ Layout */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout
  onLogout={() => {
    localStorage.removeItem("token");
    setUserPoints(0);          // 👈 مهم: نرجّع النقاط للصفر عند الخروج
    window.location.href = "/login";
  }}
                  isDarkMode={isDarkMode}
                  onToggleTheme={toggleTheme}
                >
                  <Routes>
                    <Route
                      path="dashboard"
                      element={
                        <Dashboard
                          onLogout={() => {}}
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
                    <Route path="ai-builder" element={<AIWorkoutBuilder onLogout={() => {}} onSavePlan={handleSavePlan} savedPlans={savedPlans} />} />
<Route path="plan/:id" element={<WorkoutDetails onLogout={() => {}} />} />
                    <Route path="nutrition" element={<NutritionPlanner onLogout={() => {}} />} />
                    <Route path="leaderboard" element={<Leaderboard onLogout={() => {}} userPoints={userPoints} onPointsUpdate={handlePointsUpdate} leaderboardRank={leaderboardRank} />} />
                    <Route path="no-rep-counter" element={<NoRepCounter onLogout={() => {}} />} />
                    <Route path="community" element={<CommunityHub onLogout={() => {}} userPoints={userPoints} onPointsUpdate={handlePointsUpdate} />} />
                    <Route path="audio-library" element={<AudioLibrary onLogout={() => {}} />} />
                    <Route path="settings" element={<SettingsPage onLogout={() => {}} />} />
                      <Route path="workout-form" element={<WorkoutForm onLogout={() => {}} />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
