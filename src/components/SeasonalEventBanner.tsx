import { motion } from "framer-motion";
import { formatDistanceToNow, differenceInDays, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, Sparkles, Gift, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useActiveSeasonalEvents } from "@/hooks/useSeasonalEvents";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function SeasonalEventBanner() {
  const { events, isLoading } = useActiveSeasonalEvents();
  const navigate = useNavigate();

  if (isLoading || events.length === 0) return null;

  const event = events[0]; // Show first active event
  const endsAt = new Date(event.ends_at);
  const now = new Date();
  const daysRemaining = differenceInDays(endsAt, now);
  const hoursRemaining = differenceInHours(endsAt, now) % 24;

  const timeText = daysRemaining > 0 
    ? `${daysRemaining}d ${hoursRemaining}h restantes`
    : `${hoursRemaining}h restantes`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card
        className="overflow-hidden cursor-pointer group"
        style={{ 
          background: `linear-gradient(135deg, ${event.banner_color}20, ${event.banner_color}40)`,
          borderColor: `${event.banner_color}50`,
        }}
        onClick={() => navigate(`/eventos/${event.id}`)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <motion.div
              className="text-4xl"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              {event.icon}
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg truncate">{event.title}</h3>
                <motion.span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${event.banner_color}30`,
                    color: event.banner_color,
                  }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {event.xp_multiplier}x XP
                </motion.span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {event.description}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{timeText}</span>
                </div>
                <div className="flex items-center gap-1 text-xs" style={{ color: event.banner_color }}>
                  <Gift className="h-3 w-3" />
                  <span>Recompensas exclusivas</span>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <motion.div
              className="text-muted-foreground group-hover:text-foreground transition-colors"
              whileHover={{ x: 5 }}
            >
              <ChevronRight className="h-5 w-5" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
