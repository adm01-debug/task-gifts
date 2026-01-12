import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LockoutStatus {
  is_locked: boolean;
  failed_attempts: number;
  remaining_seconds: number;
  lockout_until: string | null;
  lockout_minutes?: number;
}

export function useLoginLockout(email: string) {
  const [lockoutStatus, setLockoutStatus] = useState<LockoutStatus | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  // Check lockout status
  const checkLockout = useCallback(async () => {
    if (!email || email.length < 3) {
      setLockoutStatus(null);
      setRemainingTime(0);
      return null;
    }

    setIsChecking(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.rpc as any)("check_login_lockout", {
        p_email: email.toLowerCase().trim(),
      });

      if (error) {
        console.error("Error checking lockout:", error);
        return null;
      }

      const status = data as unknown as LockoutStatus;
      setLockoutStatus(status);
      setRemainingTime(status?.remaining_seconds || 0);
      return status;
    } catch (err: unknown) {
      console.error("Lockout check failed:", err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setIsChecking(false);
    }
  }, [email]);

  // Log failed login attempt
  const logFailedAttempt = useCallback(async (errorMessage: string) => {
    if (!email) return null;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.rpc as any)("log_login_attempt", {
        p_email: email.toLowerCase().trim(),
        p_ip_address: null,
        p_user_agent: navigator.userAgent,
        p_attempt_type: "password",
        p_error_message: errorMessage,
      });

      if (error) {
        console.error("Error logging attempt:", error);
        return null;
      }

      const result = data as unknown as { log_id: string; lockout_status: LockoutStatus };
      if (result?.lockout_status) {
        setLockoutStatus(result.lockout_status);
        setRemainingTime(result.lockout_status.remaining_seconds || 0);
        return result.lockout_status;
      }
      return null;
    } catch (err: unknown) {
      console.error("Failed to log attempt:", err instanceof Error ? err.message : String(err));
      return null;
    }
  }, [email]);

  // Reset attempts after successful login
  const resetAttempts = useCallback(async () => {
    if (!email) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.rpc as any)("reset_login_attempts", {
        p_email: email.toLowerCase().trim(),
      });
      setLockoutStatus(null);
      setRemainingTime(0);
    } catch (err: unknown) {
      console.error("Failed to reset attempts:", err instanceof Error ? err.message : String(err));
    }
  }, [email]);

  // Countdown timer
  useEffect(() => {
    if (remainingTime <= 0) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          setLockoutStatus((status) =>
            status ? { ...status, is_locked: false, remaining_seconds: 0 } : null
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingTime]);

  // Format remaining time for display
  const formatRemainingTime = useCallback(() => {
    if (remainingTime <= 0) return "";
    
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${seconds}s`;
  }, [remainingTime]);

  return {
    lockoutStatus,
    remainingTime,
    isLocked: lockoutStatus?.is_locked ?? false,
    failedAttempts: lockoutStatus?.failed_attempts ?? 0,
    isChecking,
    checkLockout,
    logFailedAttempt,
    resetAttempts,
    formatRemainingTime,
  };
}
