import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Dumbbell,
  Utensils,
  Trophy,
  Target,
  Headphones,
  Users,
  User,
  Moon,
  Sun,
  Activity,
} from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

interface SidebarProps {
  currentPage?: string;
  onLogout: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export function Sidebar({ currentPage, onLogout, isDarkMode, onToggleTheme }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "workout-builder", label: "AI Workout Builder", icon: Dumbbell, path: "/ai-builder" },
    { id: "nutrition", label: "AI Nutrition Tracker", icon: Utensils, path: "/nutrition" },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy, path: "/leaderboard" },
    { id: "no-rep", label: "No-Rep Counter", icon: Target, path: "/no-rep-counter" },
    { id: "audio", label: "Audio Library", icon: Headphones, path: "/audio-library" },
    { id: "community", label: "Community", icon: Users, path: "/community" },
    { id: "profile", label: "Settings", icon: User, path: "/settings" },
  ];

  return (
    <div className="flex h-full w-64 bg-card border-r border-border flex-col">
      {/* Header */}
      <div className="p-6 flex items-center gap-2 border-b border-border">
        <Activity className="w-6 h-6 text-primary" />
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
          FIT11
        </span>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-2">
        <p className="px-2 text-xs font-semibold text-muted-foreground mb-2">Menu</p>
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={location.pathname === item.path || currentPage === item.id ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 text-sm ${
                location.pathname === item.path || currentPage === item.id
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Button>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Separator />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={onToggleTheme}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </Button>
      </div>
    </div>
  );
}
