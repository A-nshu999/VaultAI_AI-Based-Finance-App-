// components/theme-toggle.jsx
"use client";

import React from "react";
import { useTheme } from "./theme-provider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ className = "" }) {
  const { theme, setTheme } = useTheme();

  const resolved =
    theme === "system"
      ? typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;

  const toggle = () => setTheme(resolved === "dark" ? "light" : "dark");

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        aria-label="Toggle theme"
        onClick={toggle}
        className="p-2 rounded-md border bg-white/90 dark:bg-black/70 shadow-sm hover:opacity-95 transition"
        title="Toggle theme"
      >
        {resolved === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <select
        value={theme ?? "system"}
        onChange={(e) => setTheme(e.target.value)}
        className="hidden sm:inline-block bg-transparent text-sm"
        aria-label="Theme"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  );
}
