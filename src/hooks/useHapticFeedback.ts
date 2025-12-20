import { useCallback } from "react";

type HapticPattern = "success" | "error" | "warning" | "light" | "medium" | "heavy" | "selection";

interface HapticOptions {
  pattern?: number[];
  fallbackVibration?: number;
}

/**
 * Hook for haptic feedback on mobile devices
 * Provides tactile feedback for gamification events
 */
export function useHapticFeedback() {
  const isSupported = typeof navigator !== "undefined" && "vibrate" in navigator;

  const vibrate = useCallback((pattern: number | number[]): boolean => {
    if (!isSupported) return false;
    
    try {
      return navigator.vibrate(pattern);
    } catch {
      return false;
    }
  }, [isSupported]);

  const trigger = useCallback((type: HapticPattern, options?: HapticOptions): boolean => {
    if (!isSupported) return false;

    // Custom pattern takes priority
    if (options?.pattern) {
      return vibrate(options.pattern);
    }

    // Predefined patterns optimized for different feedback types
    const patterns: Record<HapticPattern, number | number[]> = {
      // Short, crisp feedback for selections
      selection: 10,
      
      // Light tap
      light: 15,
      
      // Medium feedback
      medium: 30,
      
      // Strong feedback
      heavy: 50,
      
      // Success: Double pulse (celebration)
      success: [30, 50, 30],
      
      // Warning: Triple quick pulses
      warning: [20, 30, 20, 30, 20],
      
      // Error: Long pulse
      error: [100],
    };

    return vibrate(patterns[type] || options?.fallbackVibration || 20);
  }, [isSupported, vibrate]);

  // Specific gamification feedback methods
  const xpGained = useCallback((amount: number) => {
    if (amount >= 100) {
      // Big XP gain: celebration pattern
      return trigger("success");
    } else if (amount >= 50) {
      return trigger("medium");
    }
    return trigger("light");
  }, [trigger]);

  const levelUp = useCallback(() => {
    // Level up: Extended celebration
    return vibrate([50, 100, 50, 100, 50, 100, 100]);
  }, [vibrate]);

  const achievementUnlocked = useCallback(() => {
    // Achievement: Grand celebration
    return vibrate([30, 50, 30, 50, 30, 100, 50, 50]);
  }, [vibrate]);

  const questCompleted = useCallback(() => {
    return trigger("success");
  }, [trigger]);

  const streakMilestone = useCallback((days: number) => {
    if (days >= 30) {
      return vibrate([50, 50, 50, 50, 50, 100, 100]);
    } else if (days >= 7) {
      return vibrate([30, 50, 30, 50, 100]);
    }
    return trigger("success");
  }, [vibrate, trigger]);

  const comboMultiplier = useCallback((multiplier: number) => {
    // Quick pulses based on multiplier
    const pulses = Math.min(multiplier, 5);
    const pattern = Array(pulses).fill([20, 30]).flat();
    return vibrate(pattern);
  }, [vibrate]);

  const buttonPress = useCallback(() => {
    return trigger("selection");
  }, [trigger]);

  const error = useCallback(() => {
    return trigger("error");
  }, [trigger]);

  const coinCollected = useCallback(() => {
    return trigger("light");
  }, [trigger]);

  const duelWon = useCallback(() => {
    return vibrate([50, 100, 50, 100, 50, 200]);
  }, [vibrate]);

  const kudosReceived = useCallback(() => {
    return trigger("medium");
  }, [trigger]);

  return {
    isSupported,
    trigger,
    vibrate,
    // Gamification-specific methods
    xpGained,
    levelUp,
    achievementUnlocked,
    questCompleted,
    streakMilestone,
    comboMultiplier,
    buttonPress,
    error,
    coinCollected,
    duelWon,
    kudosReceived,
  };
}
