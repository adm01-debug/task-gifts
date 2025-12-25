import { useEffect, useCallback, useState } from "react";

type Theme = "light" | "dark" | "system";

interface UseSystemThemeOptions {
  /** Storage key for persisting theme preference */
  storageKey?: string;
  /** Default theme if no preference is set */
  defaultTheme?: Theme;
  /** Whether to sync with system theme */
  syncWithSystem?: boolean;
}

interface UseSystemThemeReturn {
  /** Current resolved theme (light or dark) */
  theme: "light" | "dark";
  /** User's theme preference (includes system) */
  preference: Theme;
  /** Whether currently using system theme */
  isSystemTheme: boolean;
  /** Whether system prefers dark mode */
  systemPrefersDark: boolean;
  /** Set theme preference */
  setTheme: (theme: Theme) => void;
  /** Toggle between light and dark */
  toggle: () => void;
}

/**
 * useSystemTheme - Hook for managing theme with system sync
 * 
 * Features:
 * - Syncs with system preference
 * - Persists user preference
 * - Real-time updates when system theme changes
 */
export function useSystemTheme(options: UseSystemThemeOptions = {}): UseSystemThemeReturn {
  const {
    storageKey = "theme-preference",
    defaultTheme = "system",
    syncWithSystem = true,
  } = options;

  // Check if system prefers dark mode
  const getSystemPreference = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }, []);

  // Get stored preference
  const getStoredPreference = useCallback((): Theme => {
    if (typeof localStorage === "undefined") return defaultTheme;
    return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
  }, [storageKey, defaultTheme]);

  const [preference, setPreference] = useState<Theme>(getStoredPreference);
  const [systemPrefersDark, setSystemPrefersDark] = useState(getSystemPreference);

  // Resolve actual theme
  const resolvedTheme: "light" | "dark" = preference === "system"
    ? (systemPrefersDark ? "dark" : "light")
    : preference;

  // Apply theme to document
  const applyTheme = useCallback((theme: "light" | "dark") => {
    const root = document.documentElement;
    
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        theme === "dark" ? "#0a0a0a" : "#ffffff"
      );
    }
  }, []);

  // Set theme preference
  const setTheme = useCallback((theme: Theme) => {
    setPreference(theme);
    localStorage.setItem(storageKey, theme);
  }, [storageKey]);

  // Toggle between light and dark
  const toggle = useCallback(() => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (!syncWithSystem) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [syncWithSystem]);

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme, applyTheme]);

  // Initialize from storage on mount
  useEffect(() => {
    const stored = getStoredPreference();
    if (stored !== preference) {
      setPreference(stored);
    }
  }, [getStoredPreference, preference]);

  return {
    theme: resolvedTheme,
    preference,
    isSystemTheme: preference === "system",
    systemPrefersDark,
    setTheme,
    toggle,
  };
}
