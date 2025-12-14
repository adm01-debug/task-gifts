import { useState } from "react";
import { Menu, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { MobileDrawer } from "./MobileDrawer";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileHeaderProps {
  title?: string;
  showTitle?: boolean;
}

export function MobileHeader({ title, showTitle = true }: MobileHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-14 items-center justify-between px-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setDrawerOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </motion.button>

          {showTitle && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Gift className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sm">
                {title || "Task Gifts"}
              </span>
            </div>
          )}

          {/* Placeholder for right side actions */}
          <div className="w-10" />
        </div>
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
