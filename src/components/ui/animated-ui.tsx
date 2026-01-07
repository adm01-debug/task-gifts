import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, ChevronUp, Settings, Bell, 
  User, LogOut, HelpCircle, Moon, Sun,
  Keyboard, Shield, CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

// Animated Dropdown Menu
interface DropdownItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  danger?: boolean;
  divider?: boolean;
}

interface AnimatedDropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export const AnimatedDropdown = memo(function AnimatedDropdown({
  trigger,
  items,
  align = "right",
  className,
}: AnimatedDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "absolute top-full mt-2 z-50 min-w-[200px]",
                "bg-popover border border-border rounded-xl shadow-lg overflow-hidden",
                align === "right" ? "right-0" : "left-0"
              )}
            >
              <div className="py-1">
                {items.map((item, index) => {
                  if (item.divider) {
                    return <div key={index} className="h-px bg-border my-1" />;
                  }

                  const Icon = item.icon;

                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => {
                        item.onClick?.();
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                        item.danger
                          ? "text-red-500 hover:bg-red-500/10"
                          : "text-foreground hover:bg-muted"
                      )}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.1 }}
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      <span>{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});

// Animated Accordion
interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: LucideIcon;
}

interface AnimatedAccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export const AnimatedAccordion = memo(function AnimatedAccordion({
  items,
  allowMultiple = false,
  className,
}: AnimatedAccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = useCallback((id: string) => {
    setOpenItems((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      return allowMultiple ? [...prev, id] : [id];
    });
  }, [allowMultiple]);

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item) => {
        const isOpen = openItems.includes(item.id);
        const Icon = item.icon;

        return (
          <div
            key={item.id}
            className="border border-border rounded-xl overflow-hidden"
          >
            <motion.button
              onClick={() => toggleItem(item.id)}
              className={cn(
                "w-full flex items-center justify-between p-4",
                "text-left bg-card hover:bg-muted/50 transition-colors"
              )}
              whileTap={{ scale: 0.995 }}
            >
              <div className="flex items-center gap-3">
                {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
                <span className="font-medium">{item.title}</span>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-4 pt-0 text-sm text-muted-foreground">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
});

// Animated Tabs
interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  content: React.ReactNode;
}

interface AnimatedTabsProps {
  items: TabItem[];
  defaultTab?: string;
  className?: string;
}

export const AnimatedTabs = memo(function AnimatedTabs({
  items,
  defaultTab,
  className,
}: AnimatedTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id);

  const activeContent = items.find((item) => item.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab headers */}
      <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-background rounded-lg shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              {Icon && <Icon className="w-4 h-4 relative z-10" />}
              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="mt-4"
        >
          {activeContent}
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

// Animated Modal/Dialog
interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const AnimatedModal = memo(function AnimatedModal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className,
}: AnimatedModalProps) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className={cn(
              "relative w-full bg-background rounded-2xl shadow-2xl overflow-hidden",
              sizeClasses[size],
              className
            )}
          >
            {title && (
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-lg font-bold">{title}</h2>
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// Animated Tooltip
interface AnimatedTooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export const AnimatedTooltip = memo(function AnimatedTooltip({
  content,
  children,
  side = "top",
  className,
}: AnimatedTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-popover",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-popover",
    left: "left-full top-1/2 -translate-y-1/2 border-l-popover",
    right: "right-full top-1/2 -translate-y-1/2 border-r-popover",
  };

  return (
    <div
      className={cn("relative inline-block", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
            className={cn(
              "absolute z-50 px-3 py-1.5 text-xs font-medium",
              "bg-popover text-popover-foreground rounded-lg shadow-lg",
              "whitespace-nowrap pointer-events-none",
              positionClasses[side]
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
