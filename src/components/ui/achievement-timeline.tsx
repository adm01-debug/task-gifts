import { memo, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Award,
  Calendar,
  Filter,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TimelineEvent {
  id: string;
  type: "achievement" | "level_up" | "quest" | "streak" | "special";
  title: string;
  description?: string;
  date: Date;
  icon?: string;
  xpReward?: number;
  coinReward?: number;
  rarity?: "common" | "rare" | "epic" | "legendary";
}

interface AchievementTimelineProps {
  events?: TimelineEvent[];
  className?: string;
  maxItems?: number;
}

// Sample events generator
function generateSampleEvents(): TimelineEvent[] {
  const types: TimelineEvent["type"][] = ["achievement", "level_up", "quest", "streak", "special"];
  const rarities: TimelineEvent["rarity"][] = ["common", "rare", "epic", "legendary"];
  const events: TimelineEvent[] = [];

  const titles: Record<TimelineEvent["type"], string[]> = {
    achievement: ["Primeiro Login", "Mestre das Missões", "Colaborador Estrela", "Mentor"],
    level_up: ["Nível 5 Alcançado", "Nível 10 Alcançado", "Nível 15 Alcançado"],
    quest: ["Missão Diária Completa", "Missão Semanal Completa", "Desafio Especial"],
    streak: ["3 Dias Seguidos", "7 Dias Seguidos", "30 Dias Seguidos"],
    special: ["Evento de Aniversário", "Top 10 do Mês", "Colaborador do Trimestre"],
  };

  const now = new Date();
  for (let i = 0; i < 20; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 60));
    
    events.push({
      id: `event-${i}`,
      type,
      title: titles[type][Math.floor(Math.random() * titles[type].length)],
      description: "Parabéns pela conquista!",
      date,
      xpReward: Math.floor(Math.random() * 500) + 50,
      coinReward: Math.floor(Math.random() * 100) + 10,
      rarity: rarities[Math.floor(Math.random() * rarities.length)],
    });
  }

  return events.sort((a, b) => b.date.getTime() - a.date.getTime());
}

const typeIcons: Record<TimelineEvent["type"], React.ElementType> = {
  achievement: Trophy,
  level_up: Star,
  quest: Target,
  streak: Zap,
  special: Award,
};

const typeColors: Record<TimelineEvent["type"], string> = {
  achievement: "from-yellow-500 to-orange-500",
  level_up: "from-purple-500 to-pink-500",
  quest: "from-blue-500 to-cyan-500",
  streak: "from-green-500 to-emerald-500",
  special: "from-rose-500 to-red-500",
};

const rarityColors: Record<string, string> = {
  common: "border-gray-400 bg-gray-500/10",
  rare: "border-blue-400 bg-blue-500/10",
  epic: "border-purple-400 bg-purple-500/10",
  legendary: "border-yellow-400 bg-yellow-500/10",
};

const rarityGlows: Record<string, string> = {
  common: "",
  rare: "shadow-blue-500/20",
  epic: "shadow-purple-500/30",
  legendary: "shadow-yellow-500/40 animate-pulse",
};

export const AchievementTimeline = memo(function AchievementTimeline({
  events,
  className,
  maxItems,
}: AchievementTimelineProps) {
  const [filter, setFilter] = useState<TimelineEvent["type"] | "all">("all");
  const [expanded, setExpanded] = useState(false);

  const allEvents = useMemo(() => events || generateSampleEvents(), [events]);

  const filteredEvents = useMemo(() => {
    let filtered = filter === "all" 
      ? allEvents 
      : allEvents.filter((e) => e.type === filter);
    
    if (!expanded && maxItems) {
      filtered = filtered.slice(0, maxItems);
    }
    
    return filtered;
  }, [allEvents, filter, expanded, maxItems]);

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {};
    
    filteredEvents.forEach((event) => {
      const dateKey = event.date.toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });
    
    return groups;
  }, [filteredEvents]);

  const filterLabels: Record<TimelineEvent["type"] | "all", string> = {
    all: "Todos",
    achievement: "Conquistas",
    level_up: "Níveis",
    quest: "Missões",
    streak: "Sequências",
    special: "Especiais",
  };

  return (
    <div className={cn("rounded-xl border bg-card", className)}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Linha do Tempo
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {allEvents.length} conquistas registradas
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {filterLabels[filter]}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.keys(filterLabels) as (TimelineEvent["type"] | "all")[]).map((key) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setFilter(key)}
                  className={cn(filter === key && "bg-primary/10")}
                >
                  {filterLabels[key]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />

          <AnimatePresence mode="popLayout">
            {Object.entries(groupedEvents).map(([date, events], groupIndex) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: groupIndex * 0.1 }}
                className="mb-6 last:mb-0"
              >
                {/* Date header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center z-10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{date}</span>
                </div>

                {/* Events for this date */}
                <div className="ml-5 pl-8 space-y-3">
                  {events.map((event, eventIndex) => {
                    const Icon = typeIcons[event.type];
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: groupIndex * 0.1 + eventIndex * 0.05 }}
                        className={cn(
                          "relative p-4 rounded-lg border-l-4 transition-all hover:scale-[1.02]",
                          rarityColors[event.rarity || "common"],
                          rarityGlows[event.rarity || "common"]
                        )}
                      >
                        {/* Connector dot */}
                        <div className="absolute -left-[26px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background" />

                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "p-2 rounded-lg bg-gradient-to-br",
                            typeColors[event.type]
                          )}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold truncate">{event.title}</span>
                              {event.rarity === "legendary" && (
                                <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                              )}
                            </div>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {event.description}
                              </p>
                            )}
                            
                            {/* Rewards */}
                            <div className="flex items-center gap-3 mt-2">
                              {event.xpReward && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-600">
                                  +{event.xpReward} XP
                                </span>
                              )}
                              {event.coinReward && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600">
                                  +{event.coinReward} 🪙
                                </span>
                              )}
                              {event.rarity && event.rarity !== "common" && (
                                <span className={cn(
                                  "text-xs px-2 py-0.5 rounded-full capitalize",
                                  event.rarity === "rare" && "bg-blue-500/20 text-blue-600",
                                  event.rarity === "epic" && "bg-purple-500/20 text-purple-600",
                                  event.rarity === "legendary" && "bg-yellow-500/20 text-yellow-600"
                                )}>
                                  {event.rarity}
                                </span>
                              )}
                            </div>
                          </div>

                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {event.date.toLocaleTimeString("pt-BR", { 
                              hour: "2-digit", 
                              minute: "2-digit" 
                            })}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Show more button */}
        {maxItems && allEvents.length > maxItems && (
          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Mostrar menos" : `Ver mais ${allEvents.length - maxItems} eventos`}
            <ChevronDown className={cn(
              "h-4 w-4 ml-2 transition-transform",
              expanded && "rotate-180"
            )} />
          </Button>
        )}
      </div>
    </div>
  );
});

// Compact version for sidebars
export const MiniAchievementTimeline = memo(function MiniAchievementTimeline({
  events,
  className,
}: {
  events?: TimelineEvent[];
  className?: string;
}) {
  const recentEvents = useMemo(() => {
    return (events || generateSampleEvents()).slice(0, 5);
  }, [events]);

  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">Atividade Recente</span>
        <Sparkles className="h-4 w-4 text-primary" />
      </div>

      <div className="space-y-2">
        {recentEvents.map((event, i) => {
          const Icon = typeIcons[event.type];
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 text-sm"
            >
              <div className={cn(
                "p-1.5 rounded bg-gradient-to-br",
                typeColors[event.type]
              )}>
                <Icon className="h-3 w-3 text-white" />
              </div>
              <span className="truncate flex-1">{event.title}</span>
              <span className="text-xs text-muted-foreground">
                {event.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});
