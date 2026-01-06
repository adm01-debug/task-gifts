import { memo } from "react";
import { motion } from "framer-motion";
import { Gift } from "lucide-react";

interface SidebarLogoProps {
  collapsed: boolean;
}

export const SidebarLogo = memo(function SidebarLogo({ collapsed }: SidebarLogoProps) {
  return (
    <div className="p-4 border-b border-sidebar-border">
      <motion.div
        className="flex items-center gap-3"
        animate={{ justifyContent: collapsed ? "center" : "flex-start" }}
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary">
            <Gift className="w-5 h-5 text-primary-foreground" />
          </div>
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            <h1 className="font-bold text-lg text-sidebar-foreground">Task Gifts</h1>
            <p className="text-xs text-muted-foreground">Gamify your work</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
});
