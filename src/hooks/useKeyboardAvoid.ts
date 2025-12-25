import { useEffect, useRef, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface UseKeyboardAvoidOptions {
  /** Offset from keyboard in pixels */
  offset?: number;
  /** Whether to enable the behavior */
  enabled?: boolean;
}

/**
 * useKeyboardAvoid - Automatically scrolls focused input into view above keyboard
 * 
 * Solves the common mobile issue where the virtual keyboard covers input fields
 */
export function useKeyboardAvoid(options: UseKeyboardAvoidOptions = {}) {
  const { offset = 20, enabled = true } = options;
  const isMobile = useIsMobile();
  const isKeyboardOpen = useRef(false);
  const initialViewportHeight = useRef<number>(0);

  const handleFocusIn = useCallback((event: FocusEvent) => {
    if (!enabled || !isMobile) return;

    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    
    // Only handle input elements
    if (!["input", "textarea", "select"].includes(tagName)) return;
    
    // Skip if input is read-only
    if ((target as HTMLInputElement).readOnly) return;

    // Wait for keyboard to open
    setTimeout(() => {
      const visualViewport = window.visualViewport;
      
      if (visualViewport) {
        const keyboardHeight = initialViewportHeight.current - visualViewport.height;
        
        if (keyboardHeight > 100) {
          isKeyboardOpen.current = true;
          
          // Calculate if element is behind keyboard
          const rect = target.getBoundingClientRect();
          const viewportBottom = visualViewport.height;
          
          if (rect.bottom > viewportBottom - offset) {
            // Scroll the element into view
            target.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }
      } else {
        // Fallback for browsers without visualViewport
        target.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 300);
  }, [enabled, isMobile, offset]);

  const handleFocusOut = useCallback(() => {
    isKeyboardOpen.current = false;
  }, []);

  const handleResize = useCallback(() => {
    if (!window.visualViewport) return;
    
    // Update initial height when not focused
    if (!isKeyboardOpen.current) {
      initialViewportHeight.current = window.visualViewport.height;
    }
  }, []);

  useEffect(() => {
    if (!enabled || !isMobile) return;

    // Initialize viewport height
    initialViewportHeight.current = window.visualViewport?.height || window.innerHeight;

    // Add event listeners
    document.addEventListener("focusin", handleFocusIn, { passive: true });
    document.addEventListener("focusout", handleFocusOut, { passive: true });
    window.visualViewport?.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      window.visualViewport?.removeEventListener("resize", handleResize);
    };
  }, [enabled, isMobile, handleFocusIn, handleFocusOut, handleResize]);

  return {
    isKeyboardOpen: isKeyboardOpen.current,
  };
}

/**
 * KeyboardAvoidingView - Component wrapper for keyboard avoiding behavior
 */
export function useKeyboardAvoidingContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile || !containerRef.current) return;

    const container = containerRef.current;

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      
      if (["input", "textarea"].includes(target.tagName.toLowerCase())) {
        // Add class to adjust layout
        container.style.paddingBottom = "300px";
        
        setTimeout(() => {
          target.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
      }
    };

    const handleFocusOut = () => {
      container.style.paddingBottom = "";
    };

    container.addEventListener("focusin", handleFocusIn);
    container.addEventListener("focusout", handleFocusOut);

    return () => {
      container.removeEventListener("focusin", handleFocusIn);
      container.removeEventListener("focusout", handleFocusOut);
    };
  }, [isMobile]);

  return containerRef;
}
