import { useCallback, useRef } from "react";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

interface UseDoubleTapOptions {
  /** Callback when double tap is detected */
  onDoubleTap: () => void;
  /** Optional callback for single tap (fires with delay) */
  onSingleTap?: () => void;
  /** Max time between taps in ms (default: 300) */
  threshold?: number;
  /** Disable the gesture */
  disabled?: boolean;
  /** Enable haptic feedback (default: true) */
  hapticEnabled?: boolean;
}

interface UseDoubleTapResult {
  onClick: (e?: React.MouseEvent | React.TouchEvent) => void;
  onTouchEnd: (e?: React.TouchEvent) => void;
}

/**
 * useDoubleTap - Detects double tap/click gestures
 * 
 * Usage:
 * const doubleTapProps = useDoubleTap({
 *   onDoubleTap: () => likePhoto(),
 *   onSingleTap: () => openDetails(),
 * });
 * 
 * <div {...doubleTapProps}>Double tap to like</div>
 */
export function useDoubleTap({
  onDoubleTap,
  onSingleTap,
  threshold = 300,
  disabled = false,
  hapticEnabled = true,
}: UseDoubleTapOptions): UseDoubleTapResult {
  const lastTapRef = useRef<number>(0);
  const singleTapTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const haptic = useHapticFeedback();

  const handleTap = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;

    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < threshold && timeSinceLastTap > 0) {
      // Double tap detected
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
      }
      
      if (hapticEnabled) {
        haptic.trigger("success");
      }
      
      onDoubleTap();
      lastTapRef.current = 0;
    } else {
      // Possible single tap - wait to see if double tap follows
      lastTapRef.current = now;
      
      if (onSingleTap) {
        if (singleTapTimerRef.current) {
          clearTimeout(singleTapTimerRef.current);
        }
        
        singleTapTimerRef.current = setTimeout(() => {
          onSingleTap();
        }, threshold);
      }
    }
  }, [disabled, threshold, onDoubleTap, onSingleTap, hapticEnabled, haptic]);

  return {
    onClick: handleTap,
    onTouchEnd: handleTap,
  };
}
