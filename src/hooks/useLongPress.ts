import { useCallback, useRef, useState } from "react";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

interface UseLongPressOptions {
  /** Duration in ms to trigger long press (default: 500) */
  threshold?: number;
  /** Callback when long press is triggered */
  onLongPress: () => void;
  /** Optional callback for regular click */
  onClick?: () => void;
  /** Disable the gesture */
  disabled?: boolean;
  /** Enable haptic feedback (default: true) */
  hapticEnabled?: boolean;
}

interface UseLongPressResult {
  onMouseDown: () => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: () => void;
  onTouchEnd: () => void;
  isPressed: boolean;
  isLongPressing: boolean;
}

/**
 * useLongPress - Detects long press gestures on mobile and desktop
 * 
 * Usage:
 * const longPressProps = useLongPress({
 *   onLongPress: () => openContextMenu(),
 *   onClick: () => selectItem(),
 * });
 * 
 * <div {...longPressProps}>Press and hold</div>
 */
export function useLongPress({
  threshold = 500,
  onLongPress,
  onClick,
  disabled = false,
  hapticEnabled = true,
}: UseLongPressOptions): UseLongPressResult {
  const [isPressed, setIsPressed] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const isLongPressRef = useRef(false);
  const haptic = useHapticFeedback();

  const start = useCallback(() => {
    if (disabled) return;
    
    setIsPressed(true);
    isLongPressRef.current = false;

    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setIsLongPressing(true);
      
      if (hapticEnabled) {
        haptic.trigger("success");
      }
      
      onLongPress();
    }, threshold);
  }, [disabled, threshold, onLongPress, hapticEnabled, haptic]);

  const end = useCallback(() => {
    setIsPressed(false);
    setIsLongPressing(false);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Only trigger onClick if it wasn't a long press
    if (!isLongPressRef.current && onClick) {
      onClick();
    }
  }, [onClick]);

  const cancel = useCallback(() => {
    setIsPressed(false);
    setIsLongPressing(false);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: end,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: end,
    isPressed,
    isLongPressing,
  };
}
