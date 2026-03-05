"use client";

import { createContext, useContext, useEffect, useState } from "react";

// The "shape" of what we share via context
type Theme = "dark" | "light";
interface ThemeContextType {
  theme: Theme;
  toggle: () => void;
}

// Create context with defaults
const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggle: () => {},
});

// Hook — any component calls: const { theme, toggle } = useTheme();
export function useTheme() {
  return useContext(ThemeContext);
}

// Provider — wraps the whole app in layout.tsx
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // On first load, check if user had a saved preference
  useEffect(() => {
    const saved = localStorage.getItem("pb3d-theme") as Theme | null;
    if (saved === "light" || saved === "dark") setTheme(saved);
    setMounted(true);
  }, []);

  // Whenever theme changes: update the HTML attribute + save to localStorage
  // The CSS in globals.css reads [data-theme="dark"] / [data-theme="light"]
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("pb3d-theme", theme);
  }, [theme, mounted]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // Prevent flash of wrong theme on first render
  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}