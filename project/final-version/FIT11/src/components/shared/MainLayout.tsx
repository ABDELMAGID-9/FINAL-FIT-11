import React from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Outlet } from "react-router-dom";

interface MainLayoutProps {
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export function MainLayout({ onLogout, isDarkMode, onToggleTheme }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        onLogout={onLogout}
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme}
      />

      <div className="flex flex-col flex-1 min-w-0 h-full">
        <TopBar
          onLogout={onLogout}
          isDarkMode={isDarkMode}
          onToggleTheme={onToggleTheme}
        />

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
