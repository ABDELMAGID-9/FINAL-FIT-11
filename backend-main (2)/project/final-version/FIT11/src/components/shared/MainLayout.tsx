import React from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface MainLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export function MainLayout({ children, onLogout, isDarkMode, onToggleTheme }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ✅ Sidebar دائم الظهور في اليسار */}
      <Sidebar
        onLogout={onLogout}
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme}
      />

      {/* ✅ المحتوى الرئيسي مع الـTopBar في الأعلى */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <TopBar
          onLogout={onLogout}
          isDarkMode={isDarkMode}
          onToggleTheme={onToggleTheme}
        />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
