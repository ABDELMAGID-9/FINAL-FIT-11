import React from 'react';
import { Search, User, LogOut, Menu, Home, Brain, Trophy, Target, Users as UsersIcon, Apple, Headphones, Settings } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from '../ui/dropdown-menu';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // ✅ أضف useNavigate

interface TopBarProps {
  title?: string;
  onLogout: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export function TopBar({ title, onLogout, isDarkMode, onToggleTheme }: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate(); // ✅ تعريف النفيجيشن

  // ✅ تعديل بسيط هنا
  const handleLogout = () => {
    onLogout();         // ينفّذ عملية حذف التوكن
    navigate("/login"); // يوجّه المستخدم مباشرة إلى صفحة تسجيل الدخول
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'AI Workout Builder', href: '/ai-builder', icon: Brain },
    { name: 'AI Nutrition Tracker', href: '/nutrition', icon: Apple },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'No-Rep Counter', href: '/no-rep-counter', icon: Target },
    { name: 'Audio Library', href: '/audio-library', icon: Headphones },
    { name: 'Community', href: '/community', icon: UsersIcon },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="h-auto min-h-[4rem] pt-8 pb-4 border-b bg-background flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">
      {/* باقي الكود بدون تعديل */}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt="User" />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuItem asChild>
            <Link to="/settings" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* ✅ غيّر onLogout إلى handleLogout */}
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
