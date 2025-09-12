// components/theme-provider.jsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(undefined); // 'light' | 'dark' | 'system' | undefined

  // Read stored theme on first mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      setTheme(saved || "system");
    } catch {
      setTheme("system");
    }
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;

    const apply = (t) => {
      if (t === "dark") root.classList.add("dark");
      else if (t === "light") root.classList.remove("dark");
      else {
        const prefersDark =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
        prefersDark ? root.classList.add("dark") : root.classList.remove("dark");
      }
    };

    apply(theme);

    try {
      localStorage.setItem("theme", theme);
    } catch {}

    // Listen to system preference changes if theme === 'system'
    const mq =
      typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") apply("system");
    };
    if (mq && mq.addEventListener) mq.addEventListener("change", handler);
    else if (mq && mq.addListener) mq.addListener(handler);

    return () => {
      if (mq && mq.removeEventListener) mq.removeEventListener("change", handler);
      else if (mq && mq.removeListener) mq.removeListener(handler);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
