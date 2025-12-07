import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './shared/Sidebar';
import { TopBar } from './shared/TopBar';
import { FitnessEmptyState } from './shared/FitnessEmptyState';
import { LoadingState } from './shared/LoadingState';
import { ErrorState } from './shared/ErrorState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { TrendingUp, Target, Trophy, Brain, Trash2, Eye, Plus } from 'lucide-react';
import { api } from "../lib/api"; // ✅ استدعاء الـ API
import type { SavedWorkoutPlan } from "../types/workout";


interface DashboardProps {
  onLogout: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  userPoints?: number;
  leaderboardRank?: number;
  currentStreak?: number;
  savedPlans?: SavedWorkoutPlan[]; // ✅ أضف هذه
  onDeletePlan?: (planId: string) => void; // ✅ أضف هذه
}


export function Dashboard({
  onLogout,
  isDarkMode,
  onToggleTheme,
  userPoints = 0,
  leaderboardRank = 0,
  currentStreak = 12
}: DashboardProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedWorkoutPlan[]>([]);

  // ✅ تحميل الخطط من قاعدة البيانات
  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await api<{ ok: boolean; workouts: SavedWorkoutPlan[] }>("/api/workouts");
        if (res.ok) {
          setSavedPlans(res.workouts);
        }
      } catch (err) {
        console.error("❌ Error loading workout plans:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, []);

  // ✅ حذف خطة
  const handleDeletePlan = async (id: string) => {
    try {
      if (!window.confirm("Are you sure you want to delete this plan?")) return;
      await api(`/api/workouts/${id}`, { method: "DELETE" });
      setSavedPlans(prev => prev.filter(p => p._id !== id && p.id !== id));
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("Failed to delete plan.");
    }
  };

  const handleAddNew = () => navigate('/workout-form');
  const handleAIBuilder = () => navigate('/ai-builder');

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const renderMainContent = () => {
    if (loading) return <LoadingState />;
    if (error) return <ErrorState onRetry={handleRetry} />;
    if (!savedPlans || savedPlans.length === 0) {
      return <FitnessEmptyState onAddNew={handleAddNew} onAIBuilder={handleAIBuilder} />;
    }

    return (
  <div className="space-y-10">

    {/* 🔥 Always show this section (image + buttons) */}
    <FitnessEmptyState 
      onAddNew={handleAddNew} 
      onAIBuilder={handleAIBuilder} 
      alwaysShow={true}
    />

    {/* إذا كان فيه خطط، اعرضها تحت */}
    {savedPlans.length > 0 && (
      <div className="space-y-6">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Your Workout Plans</h2>
              <p className="text-sm text-muted-foreground">AI & Manual saved routines</p>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPlans.map((plan) => (
            <Card
              key={plan._id || plan.id}
              className="hover:shadow-xl transition-all duration-300 border-muted/60 rounded-xl p-4 flex flex-col justify-between min-h-[260px]"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-bold truncate" title={plan.name}>
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm text-muted-foreground truncate">
                      {plan.split || "Manual Workout"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm bg-muted/30 p-3 rounded-md">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Goal</p>
                    <p className="capitalize truncate">
                      {(plan.goal || "manual").replace("_", " ")}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Level</p>
                    <p className="capitalize truncate">
                      {plan.experience || "custom"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                  <span>Created:</span>
                  <span>{new Date(plan.createdAt).toLocaleDateString("ar-SA")}</span>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/plan/${plan._id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
onClick={() => handleDeletePlan(String(plan._id))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    )}

  </div>
);

  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
    

      <div className="flex-1 flex flex-col min-w-0">
      

        <main className="flex-1 p-4 md:p-8 overflow-y-auto scrollbar-hide">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title="Total Plans" value={savedPlans.length} subtext="AI-generated plans" icon={TrendingUp} loading={loading} />
              <StatsCard title="Total Points" value={userPoints.toLocaleString()} subtext="Community points" icon={Trophy} loading={loading} />
              <StatsCard title="Current Streak" value={currentStreak} subtext="Days in a row" icon={Target} loading={loading} />
              <StatsCard title="Rank" value={leaderboardRank > 0 ? `#${leaderboardRank}` : '-'} subtext="Global leaderboard" icon={Trophy} loading={loading} />
            </div>

            {/* Content Area */}
            {renderMainContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

// ✅ Helper component (unchanged)
function StatsCard({ title, value, subtext, icon: Icon, loading }: { title: string, value: string | number, subtext: string, icon: any, loading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-16 bg-muted animate-pulse rounded" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
      </CardContent>
    </Card>
  );
}
