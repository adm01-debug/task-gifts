/**
 * Simple environment-based feature flags.
 *
 * Usage:
 *   if (isFeatureEnabled("NEW_DASHBOARD")) { ... }
 *
 * Configure via .env:
 *   VITE_FF_NEW_DASHBOARD=true
 *   VITE_FF_BITRIX_SYNC=false
 */

const flags: Record<string, boolean> = {};

// Load flags from environment variables (VITE_FF_*)
if (typeof import.meta !== "undefined") {
  const env = import.meta.env || {};
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith("VITE_FF_")) {
      const flagName = key.replace("VITE_FF_", "");
      flags[flagName] = value === "true" || value === "1";
    }
  }
}

export function isFeatureEnabled(flag: string): boolean {
  return flags[flag] === true;
}

export function getAllFlags(): Record<string, boolean> {
  return { ...flags };
}
