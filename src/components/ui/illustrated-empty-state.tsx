import { motion } from "framer-motion";
import { LucideIcon, Inbox, Search, FileText, Users, Target, Trophy, Gift, Bell, MessageCircle, BarChart3, Zap, Calendar, BookOpen, Shield, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Illustration SVG components for different contexts
const illustrations = {
  inbox: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="40" y="60" width="120" height="80" rx="8" className="fill-muted stroke-border" strokeWidth="2"/>
      <path d="M40 75L100 105L160 75" className="stroke-primary" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="100" cy="40" r="20" className="fill-primary/20"/>
      <path d="M92 40L98 46L108 36" className="stroke-primary" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="85" cy="70" r="40" className="stroke-border" strokeWidth="3" fill="none"/>
      <circle cx="85" cy="70" r="30" className="fill-muted/50"/>
      <line x1="115" y1="100" x2="145" y2="130" className="stroke-primary" strokeWidth="4" strokeLinecap="round"/>
      <path d="M75 60C75 60 80 55 90 55C100 55 105 60 105 60" className="stroke-muted-foreground" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="75" cy="75" r="4" className="fill-muted-foreground"/>
      <circle cx="95" cy="75" r="4" className="fill-muted-foreground"/>
    </svg>
  ),
  documents: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="50" y="30" width="80" height="100" rx="6" className="fill-card stroke-border" strokeWidth="2"/>
      <rect x="70" y="50" width="100" height="100" rx="6" className="fill-muted stroke-border" strokeWidth="2"/>
      <line x1="85" y1="80" x2="155" y2="80" className="stroke-primary/40" strokeWidth="2" strokeLinecap="round"/>
      <line x1="85" y1="95" x2="145" y2="95" className="stroke-primary/40" strokeWidth="2" strokeLinecap="round"/>
      <line x1="85" y1="110" x2="125" y2="110" className="stroke-primary/40" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  team: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="100" cy="50" r="25" className="fill-primary/20 stroke-primary" strokeWidth="2"/>
      <circle cx="100" cy="45" r="12" className="fill-primary/40"/>
      <ellipse cx="100" cy="65" rx="18" ry="10" className="fill-primary/40"/>
      <circle cx="50" cy="70" r="20" className="fill-muted stroke-border" strokeWidth="2"/>
      <circle cx="50" cy="66" r="10" className="fill-muted-foreground/30"/>
      <ellipse cx="50" cy="82" rx="14" ry="8" className="fill-muted-foreground/30"/>
      <circle cx="150" cy="70" r="20" className="fill-muted stroke-border" strokeWidth="2"/>
      <circle cx="150" cy="66" r="10" className="fill-muted-foreground/30"/>
      <ellipse cx="150" cy="82" rx="14" ry="8" className="fill-muted-foreground/30"/>
      <path d="M70 100 Q100 130 130 100" className="stroke-primary/50" strokeWidth="2" strokeDasharray="4 4"/>
    </svg>
  ),
  goals: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="100" cy="80" r="50" className="stroke-muted" strokeWidth="3" fill="none"/>
      <circle cx="100" cy="80" r="35" className="stroke-muted" strokeWidth="3" fill="none"/>
      <circle cx="100" cy="80" r="20" className="stroke-primary" strokeWidth="3" fill="none"/>
      <circle cx="100" cy="80" r="8" className="fill-primary"/>
      <path d="M140 40L105 75" className="stroke-accent" strokeWidth="3" strokeLinecap="round"/>
      <polygon points="145,30 150,45 135,45" className="fill-accent"/>
    </svg>
  ),
  trophy: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M70 40H130V80C130 100 115 110 100 110C85 110 70 100 70 80V40Z" className="fill-yellow-400/20 stroke-yellow-500" strokeWidth="2"/>
      <path d="M70 50H50C50 70 60 80 70 80" className="stroke-yellow-500" strokeWidth="2" fill="none"/>
      <path d="M130 50H150C150 70 140 80 130 80" className="stroke-yellow-500" strokeWidth="2" fill="none"/>
      <rect x="90" y="110" width="20" height="15" className="fill-yellow-500/30"/>
      <rect x="75" y="125" width="50" height="10" rx="2" className="fill-yellow-500/40"/>
      <motion.g
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <circle cx="100" cy="70" r="15" className="fill-yellow-400/40"/>
      </motion.g>
    </svg>
  ),
  gift: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="50" y="70" width="100" height="70" rx="6" className="fill-primary/20 stroke-primary" strokeWidth="2"/>
      <rect x="50" y="55" width="100" height="20" rx="4" className="fill-primary/30 stroke-primary" strokeWidth="2"/>
      <line x1="100" y1="55" x2="100" y2="140" className="stroke-primary" strokeWidth="2"/>
      <path d="M100 55C100 55 85 40 75 45C65 50 70 60 80 55C90 50 100 55 100 55Z" className="fill-accent/40 stroke-accent" strokeWidth="2"/>
      <path d="M100 55C100 55 115 40 125 45C135 50 130 60 120 55C110 50 100 55 100 55Z" className="fill-accent/40 stroke-accent" strokeWidth="2"/>
    </svg>
  ),
  notifications: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M100 30C75 30 55 50 55 75V100L45 115H155L145 100V75C145 50 125 30 100 30Z" className="fill-muted stroke-border" strokeWidth="2"/>
      <circle cx="100" cy="130" r="12" className="fill-primary"/>
      <motion.circle 
        cx="130" cy="45" r="10" 
        className="fill-destructive"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </svg>
  ),
  messages: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="40" y="40" width="90" height="60" rx="10" className="fill-primary/20 stroke-primary" strokeWidth="2"/>
      <polygon points="50,100 70,100 60,115" className="fill-primary/20 stroke-primary" strokeWidth="2"/>
      <rect x="70" y="70" width="90" height="50" rx="10" className="fill-muted stroke-border" strokeWidth="2"/>
      <polygon points="140,120 120,120 130,135" className="fill-muted stroke-border" strokeWidth="2"/>
      <line x1="55" y1="60" x2="115" y2="60" className="stroke-primary/50" strokeWidth="2" strokeLinecap="round"/>
      <line x1="55" y1="75" x2="100" y2="75" className="stroke-primary/50" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <line x1="40" y1="130" x2="160" y2="130" className="stroke-border" strokeWidth="2"/>
      <line x1="40" y1="130" x2="40" y2="30" className="stroke-border" strokeWidth="2"/>
      <rect x="55" y="90" width="20" height="40" rx="4" className="fill-primary/40"/>
      <rect x="85" y="60" width="20" height="70" rx="4" className="fill-primary/60"/>
      <rect x="115" y="80" width="20" height="50" rx="4" className="fill-primary/40"/>
      <rect x="145" y="45" width="20" height="85" rx="4" className="fill-primary"/>
      <motion.circle 
        cx="100" cy="50" r="8" 
        className="fill-accent"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </svg>
  ),
  energy: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <motion.path 
        d="M110 20L70 80H95L85 140L130 70H105L110 20Z" 
        className="fill-yellow-400 stroke-yellow-500" 
        strokeWidth="2"
        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <circle cx="100" cy="80" r="50" className="stroke-yellow-400/30" strokeWidth="4" fill="none" strokeDasharray="8 4"/>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="40" y="40" width="120" height="100" rx="8" className="fill-card stroke-border" strokeWidth="2"/>
      <rect x="40" y="40" width="120" height="25" rx="8" className="fill-primary/20"/>
      <line x1="70" y1="30" x2="70" y2="50" className="stroke-primary" strokeWidth="3" strokeLinecap="round"/>
      <line x1="130" y1="30" x2="130" y2="50" className="stroke-primary" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="70" cy="90" r="8" className="fill-muted"/>
      <circle cx="100" cy="90" r="8" className="fill-primary/40"/>
      <circle cx="130" cy="90" r="8" className="fill-muted"/>
      <circle cx="70" cy="115" r="8" className="fill-muted"/>
      <circle cx="100" cy="115" r="8" className="fill-muted"/>
      <circle cx="130" cy="115" r="8" className="fill-accent/40"/>
    </svg>
  ),
  book: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M100 130V40" className="stroke-border" strokeWidth="2"/>
      <path d="M100 40C100 40 80 30 50 35V125C80 120 100 130 100 130" className="fill-primary/20 stroke-primary" strokeWidth="2"/>
      <path d="M100 40C100 40 120 30 150 35V125C120 120 100 130 100 130" className="fill-primary/10 stroke-primary" strokeWidth="2"/>
      <line x1="60" y1="55" x2="85" y2="55" className="stroke-primary/50" strokeWidth="2" strokeLinecap="round"/>
      <line x1="60" y1="70" x2="80" y2="70" className="stroke-primary/50" strokeWidth="2" strokeLinecap="round"/>
      <line x1="60" y1="85" x2="75" y2="85" className="stroke-primary/50" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  security: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M100 25L55 45V85C55 115 75 135 100 145C125 135 145 115 145 85V45L100 25Z" className="fill-primary/20 stroke-primary" strokeWidth="2"/>
      <motion.path 
        d="M85 85L95 95L115 75" 
        className="stroke-primary" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        animate={{ pathLength: [0, 1] }}
        transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
      />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <motion.g 
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "100px 80px" }}
      >
        <circle cx="100" cy="80" r="25" className="fill-muted stroke-border" strokeWidth="2"/>
        <path d="M100 45L105 55H95L100 45Z" className="fill-primary"/>
        <path d="M100 115L95 105H105L100 115Z" className="fill-primary"/>
        <path d="M65 80L75 75V85L65 80Z" className="fill-primary"/>
        <path d="M135 80L125 85V75L135 80Z" className="fill-primary"/>
        <path d="M75 55L82 63L75 70L75 55Z" className="fill-primary" transform="rotate(-45 75 55)"/>
        <path d="M125 55L132 63L125 70L125 55Z" className="fill-primary" transform="rotate(45 125 55)"/>
        <path d="M75 105L82 97L75 90L75 105Z" className="fill-primary" transform="rotate(45 75 105)"/>
        <path d="M125 105L132 97L125 90L125 105Z" className="fill-primary" transform="rotate(-45 125 105)"/>
      </motion.g>
      <circle cx="100" cy="80" r="12" className="fill-primary/30"/>
    </svg>
  ),
};

type IllustrationType = keyof typeof illustrations;

interface IllustratedEmptyStateProps {
  illustration?: IllustrationType;
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

const iconToIllustration: Record<string, IllustrationType> = {
  Inbox: "inbox",
  Search: "search",
  FileText: "documents",
  Users: "team",
  Target: "goals",
  Trophy: "trophy",
  Gift: "gift",
  Bell: "notifications",
  MessageCircle: "messages",
  BarChart3: "chart",
  Zap: "energy",
  Calendar: "calendar",
  BookOpen: "book",
  Shield: "security",
  Settings: "settings",
};

export function IllustratedEmptyState({
  illustration,
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = "md",
}: IllustratedEmptyStateProps) {
  // Auto-detect illustration from icon if not specified
  const illustrationType = illustration || (icon?.displayName ? iconToIllustration[icon.displayName] : undefined) || "inbox";
  
  const sizeClasses = {
    sm: { container: "py-6 px-4", illustration: "w-24 h-20", title: "text-sm", description: "text-xs" },
    md: { container: "py-10 px-6", illustration: "w-40 h-32", title: "text-lg", description: "text-sm" },
    lg: { container: "py-16 px-8", illustration: "w-56 h-44", title: "text-xl", description: "text-base" },
  };

  const sizes = sizeClasses[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizes.container,
        className
      )}
    >
      <motion.div 
        className={cn("mb-6", sizes.illustration)}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {illustrations[illustrationType]}
      </motion.div>
      
      <motion.h3
        className={cn("font-semibold text-foreground mb-2", sizes.title)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h3>
      
      {description && (
        <motion.p
          className={cn("text-muted-foreground max-w-md mb-6", sizes.description)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {description}
        </motion.p>
      )}
      
      {(action || secondaryAction) && (
        <motion.div 
          className="flex flex-wrap gap-3 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {action && (
            <Button onClick={action.onClick} variant={action.variant || "default"}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="ghost">
              {secondaryAction.label}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

interface IllustratedEmptyStateCardProps extends IllustratedEmptyStateProps {
  cardClassName?: string;
}

export function IllustratedEmptyStateCard({ cardClassName, ...props }: IllustratedEmptyStateCardProps) {
  return (
    <Card className={cn("border-dashed border-2", cardClassName)}>
      <CardContent className="p-0">
        <IllustratedEmptyState {...props} />
      </CardContent>
    </Card>
  );
}

// Export illustration types for external use
export { illustrations };
export type { IllustrationType };
