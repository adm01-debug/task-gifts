import { useCallback, useMemo } from "react";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { toast } from "sonner";

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

interface UseNativeShareReturn {
  /** Whether the Web Share API is supported */
  isSupported: boolean;
  /** Whether file sharing is supported */
  canShareFiles: boolean;
  /** Share content using native share dialog */
  share: (data: ShareData) => Promise<boolean>;
  /** Copy to clipboard as fallback */
  copyToClipboard: (text: string) => Promise<boolean>;
}

/**
 * useNativeShare - Hook for native sharing functionality
 * 
 * Uses the Web Share API when available, falls back to clipboard
 */
export function useNativeShare(): UseNativeShareReturn {
  const haptic = useHapticFeedback();

  const isSupported = useMemo(() => {
    return typeof navigator !== "undefined" && !!navigator.share;
  }, []);

  const canShareFiles = useMemo(() => {
    return typeof navigator !== "undefined" && !!navigator.canShare;
  }, []);

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      haptic.trigger("success");
      toast.success("Copiado para a área de transferência!");
      return true;
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Falha ao copiar");
      return false;
    }
  }, [haptic]);

  const share = useCallback(async (data: ShareData): Promise<boolean> => {
    // Check if share API is available
    if (!isSupported) {
      // Fallback to clipboard
      const textToShare = data.url || data.text || data.title || "";
      return copyToClipboard(textToShare);
    }

    // Check if we can share files
    if (data.files && data.files.length > 0) {
      if (!canShareFiles || !navigator.canShare({ files: data.files })) {
        toast.error("Compartilhamento de arquivos não suportado");
        return false;
      }
    }

    try {
      haptic.buttonPress();
      await navigator.share(data);
      haptic.trigger("success");
      return true;
    } catch (error) {
      // User cancelled or error occurred
      if ((error as Error).name === "AbortError") {
        // User cancelled, not an error
        return false;
      }
      console.error("Share failed:", error);
      
      // Fallback to clipboard
      const textToShare = data.url || data.text || data.title || "";
      return copyToClipboard(textToShare);
    }
  }, [isSupported, canShareFiles, haptic, copyToClipboard]);

  return {
    isSupported,
    canShareFiles,
    share,
    copyToClipboard,
  };
}
