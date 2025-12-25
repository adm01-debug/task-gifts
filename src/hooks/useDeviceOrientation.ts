import { useState, useEffect, useCallback } from "react";

type Orientation = "portrait" | "landscape";

interface DeviceOrientationState {
  orientation: Orientation;
  angle: number;
  isPortrait: boolean;
  isLandscape: boolean;
}

/**
 * useDeviceOrientation - Detects device orientation changes
 * 
 * Usage:
 * const { orientation, isPortrait, isLandscape } = useDeviceOrientation();
 * 
 * if (isLandscape) {
 *   return <FullscreenPlayer />;
 * }
 */
export function useDeviceOrientation(): DeviceOrientationState {
  const getOrientation = useCallback((): DeviceOrientationState => {
    if (typeof window === "undefined") {
      return {
        orientation: "portrait",
        angle: 0,
        isPortrait: true,
        isLandscape: false,
      };
    }

    // Try screen.orientation API first
    if (window.screen?.orientation) {
      const angle = window.screen.orientation.angle;
      const isLandscape = angle === 90 || angle === 270 || angle === -90;
      
      return {
        orientation: isLandscape ? "landscape" : "portrait",
        angle,
        isPortrait: !isLandscape,
        isLandscape,
      };
    }

    // Fallback to window dimensions
    const isLandscape = window.innerWidth > window.innerHeight;
    
    return {
      orientation: isLandscape ? "landscape" : "portrait",
      angle: isLandscape ? 90 : 0,
      isPortrait: !isLandscape,
      isLandscape,
    };
  }, []);

  const [state, setState] = useState<DeviceOrientationState>(getOrientation);

  useEffect(() => {
    const handleOrientationChange = () => {
      setState(getOrientation());
    };

    // Listen to orientation change
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener("change", handleOrientationChange);
    }
    
    // Also listen to resize as fallback
    window.addEventListener("resize", handleOrientationChange);
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener("change", handleOrientationChange);
      }
      window.removeEventListener("resize", handleOrientationChange);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [getOrientation]);

  return state;
}
