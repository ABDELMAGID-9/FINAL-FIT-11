// src/components/LandingPage.tsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Apple,
  Trophy,
  Target,
  ChevronRight,
  ArrowRight,
  Star,
  Sun,
  Moon,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";

export function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement | null>(null);

  const [isDark, setIsDark] = useState(() => {
    return (
      document.documentElement.classList.contains("dark") ||
      localStorage.getItem("theme") === "dark"
    );
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((p) => !p);

  const features = [
  {
    id: "ai",
    title: "AI Workout Builder",
    desc: "Adaptive programs that evolve with your strength, fatigue and schedule.",
    icon: Brain,
    // NEON PURPLE
    badge:
      "bg-gradient-to-r from-purple-500/40 to-fuchsia-500/40 text-purple-100 border-purple-400/50 shadow-[0_0_10px_rgba(168,85,247,0.5)]",
    iconColor:
      "bg-gradient-to-br from-purple-300 to-fuchsia-300 text-purple-900 shadow-[0_0_12px_rgba(168,85,247,0.7)]",
    tag: "Smart Training",
    colSpan: "md:col-span-2",
  },

  {
    id: "norep",
    title: "No-Rep Counter",
    desc: "Computer vision ensures perfect form before bad habits form.",
    icon: Target,
    // NEON BLUE
    badge:
      "bg-gradient-to-r from-sky-500/40 to-blue-500/40 text-blue-100 border-blue-400/50 shadow-[0_0_10px_rgba(56,189,248,0.5)]",
    iconColor:
      "bg-gradient-to-br from-sky-300 to-blue-300 text-blue-900 shadow-[0_0_12px_rgba(56,189,248,0.7)]",
    tag: "Form Check",
    colSpan: "md:col-span-1",
  },

  {
    id: "nutrition",
    title: "Smart Nutrition",
    desc: "Macros that sync with your training blocks and recovery patterns.",
    icon: Apple,
    // NEON GREEN
    badge:
      "bg-gradient-to-r from-emerald-500/40 to-lime-500/40 text-emerald-100 border-emerald-400/50 shadow-[0_0_10px_rgba(52,211,153,0.5)]",
    iconColor:
      "bg-gradient-to-br from-emerald-300 to-lime-300 text-emerald-900 shadow-[0_0_12px_rgba(52,211,153,0.7)]",
    tag: "Fuel",
    colSpan: "md:col-span-1",
  },

  {
    id: "community",
    title: "Community Hub",
    desc: "Challenges, leaderboards and team-based progress tracking.",
    icon: Trophy,
    // NEON ORANGE/GOLD
    badge:
      "bg-gradient-to-r from-amber-500/40 to-orange-500/40 text-amber-100 border-amber-400/50 shadow-[0_0_10px_rgba(251,191,36,0.5)]",
    iconColor:
      "bg-gradient-to-br from-amber-300 to-orange-300 text-amber-900 shadow-[0_0_12px_rgba(251,191,36,0.7)]",
    tag: "Community",
    colSpan: "md:col-span-2",
  },
];


  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500 ease-in-out">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full h-16 md:h-20 
      bg-[#0e1624]/60 backdrop-blur-xl border-b border-white/10 shadow-sm z-[999]
      transition-all duration-500">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">

          <div
            className="text-2xl md:text-3xl font-black italic cursor-pointer tracking-tight"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            FIT<span className="text-primary">11</span>
          </div>

          <div className="hidden md:flex gap-8 text-sm text-muted-foreground">
            <button onClick={() => scrollTo("features")} className="hover:text-primary transition">Platform</button>
            <button onClick={() => scrollTo("demo")} className="hover:text-primary transition">Demo</button>
            <button onClick={() => scrollTo("stories")} className="hover:text-primary transition">Stories</button>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="p-2 rounded-full hover:bg-white/10 transition"
              onClick={toggleTheme}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-300" />
              ) : (
                <Moon className="w-5 h-5 text-slate-300" />
              )}
            </button>

            <Button
              variant="outline"
              className="px-6 rounded-full text-xs md:text-sm hover:scale-105 transition"
              onClick={() => navigate("/login")}
            >
              Log In
            </Button>

            <Button
              className="px-6 rounded-full text-xs md:text-sm shadow-md bg-primary hover:scale-105 transition"
              onClick={() => navigate("/register")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <div className="h-20"></div>

      {/* FEATURES SECTION */}
      <section id="features" className="pt-40 pb-36 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto space-y-20"
        >
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Everything you need to{" "}
              <span className="text-primary">dominate your goals</span>
            </h2>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A calm, Notion-inspired workspace that connects planning, tracking & analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {features.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                viewport={{ once: true }}
                className={f.colSpan}
              >
                <div
                  className="
                    h-full rounded-3xl 
                    bg-[#111a2b] border border-white/10 
                    shadow-lg hover:shadow-xl hover:-translate-y-2 
                    transition-all duration-300 p-8 cursor-pointer
                  "
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${f.iconColor}`}>
                      <f.icon className="w-6 h-6" />
                    </div>

                    <span className={`px-3 py-1 text-xs rounded-full border ${f.badge}`}>
                      {f.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    {f.desc}
                  </p>

                  <div className="text-primary text-sm font-semibold flex items-center group">
                    See in action{" "}
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA SECTION */}
      <section id="demo" className="py-44 px-6 bg-[#0b1220] border-t border-white/10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div
            className="
              rounded-[2rem] border border-white/10
              bg-[#111a2b]/90 shadow-2xl backdrop-blur-xl 
              p-14 text-center relative overflow-hidden
            "
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Ready to transform your training?
            </h2>

            <p className="text-lg text-blue-200 max-w-xl mx-auto mb-10 leading-relaxed">
              Join 10,000+ athletes using FIT11 as their daily training hub.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="
                  h-14 px-10 rounded-full bg-primary text-white 
                  font-semibold shadow-lg hover:bg-primary/80 hover:scale-105 transition
                "
                onClick={() => navigate("/register")}
              >
                Get started now
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="
                  h-14 px-10 rounded-full border-white/20 text-white/80 
                  bg-white/5 hover:bg-white/10 hover:scale-105 transition
                "
                onClick={() => navigate("/login")}
              >
                I already have an account
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="w-full py-14 bg-[#0b1220] border-t border-white/10 mt-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center gap-4">

          <div className="flex items-center gap-2">
            <span className="text-lg font-bold italic text-white/90">FIT11</span>
            <span className="text-white/40">The training OS for serious lifters.</span>
          </div>

          <p className="text-white/40 text-sm">
            © 2024 FIT11 Inc. All rights reserved.
          </p>

          <div className="flex gap-6 text-sm text-white/40">
            <button className="hover:text-primary transition-colors">Privacy</button>
            <button className="hover:text-primary transition-colors">Terms</button>
            <button className="hover:text-primary transition-colors">Contact</button>
          </div>

        </div>
      </footer>

    </div>
  );
}
