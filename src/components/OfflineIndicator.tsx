import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useEffect } from "react";
import { toast } from "sonner";

export function OfflineIndicator() {
  const { isOffline, wasOffline, isOnline, resetWasOffline } = useOnlineStatus();

  // Show toast when connection status changes
  useEffect(() => {
    if (isOffline) {
      toast.warning("Você está offline. Alguns recursos podem estar limitados.", {
        duration: 5000,
        id: "offline-toast",
      });
    } else if (wasOffline && isOnline) {
      toast.success("Conexão restaurada!", {
        duration: 3000,
        id: "online-toast",
      });
      resetWasOffline();
    }
  }, [isOffline, wasOffline, isOnline, resetWasOffline]);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground py-2 px-4"
        >
          <div className="container max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm font-medium">
            <WifiOff className="w-4 h-4" />
            <span>Modo Offline - Dados em cache disponíveis</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
