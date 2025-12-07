import React, { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, registerUser, me, updateUserPoints } from "../lib/api.ts";
import { useNavigate } from "react-router-dom";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  gymLevel?: string;
  points: number;
  avatar?: string;
  bio?: string;
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { firstName: string; lastName: string; email: string; password: string; gymLevel: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  addPoints: (amount: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [booted, setBooted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function fetchUser() {
      try {
        if (token) {
          const res = await me();
          setUser(res.user);
        }
      } catch (err) {
        console.error("❌ Auth check failed:", err);
        localStorage.removeItem("token");
      } finally {
        setBooted(true);
      }
    }

    fetchUser();
  }, []);

  const refreshUser = async () => {
    try {
      const res = await me();
      setUser(res.user);
    } catch (e) {
      console.error("❌ Failed to refresh user:", e);
    }
  };

  const addPoints = async (amount: number) => {
    if (!user) return;
    try {
      const res = await updateUserPoints(amount);
      setUser((prev) => (prev ? { ...prev, points: res.points } : prev));
    } catch (err) {
      console.error("❌ Failed to update points:", err);
    }
  };

  // ⭐️ تسجيل الدخول
  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    localStorage.setItem("token", res.token);
    setUser(res.user);
    navigate("/dashboard");  // 🔥 الحل الصحيح
  };

  // ⭐️ إنشاء حساب جديد
  const register = async (data: { firstName: string; lastName: string; email: string; password: string; gymLevel: string }) => {
    const res = await registerUser(data);
    localStorage.setItem("token", res.token);
    setUser(res.user);
    navigate("/dashboard"); // 🔥 الحل الصحيح
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  if (!booted) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        addPoints,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
