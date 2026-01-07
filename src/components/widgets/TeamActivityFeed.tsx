import React, { memo, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, Star, Zap, Trophy, Target, MessageSquare,
  Heart, ThumbsUp, PartyPopper, Gift, BookOpen, Users,
  TrendingUp, Award, Flame, RefreshCw, Filter
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ActivityItem {
  id: string;
  type: "achievement" | "level_up" | "quest" | "kudos" | "milestone" | "learning" | "streak";
  user: {
    name: string;
    avatar?: string;
    department: string;
  };
  content: string;
  metadata?: {
    xp?: number;
    level?: number;
    achievement?: string;
    streak?: number;
  };
  reactions: {
    emoji: string;
    count: number;
    reacted: boolean;
  }[];
  timestamp: Date;
}

const activities: ActivityItem[] = [
  {
    id: "1",
    type: "achievement",
    user: { name: "Maria Santos", department: "Marketing" },
    content: 'Conquistou o badge "Mestre da Comunicação"!',
    metadata: { xp: 500, achievement: "Mestre da Comunicação" },
    reactions: [
      { emoji: "🎉", count: 12, reacted: true },
      { emoji: "👏", count: 8, reacted: false },
      { emoji: "🔥", count: 5, reacted: false }
    ],
    timestamp: new Date(Date.now() - 5 * 60 * 1000)
  },
  {
    id: "2",
    type: "level_up",
    user: { name: "João Silva", department: "Tecnologia" },
    content: "Alcançou o Nível 25!",
    metadata: { level: 25, xp: 1000 },
    reactions: [
      { emoji: "🚀", count: 15, reacted: false },
      { emoji: "⭐", count: 10, reacted: true }
    ],
    timestamp: new Date(Date.now() - 15 * 60 * 1000)
  },
  {
    id: "3",
    type: "quest",
    user: { name: "Ana Costa", department: "RH" },
    content: 'Completou a missão "Integração Completa"',
    metadata: { xp: 300 },
    reactions: [
      { emoji: "👍", count: 7, reacted: false },
      { emoji: "💪", count: 4, reacted: false }
    ],
    timestamp: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: "4",
    type: "kudos",
    user: { name: "Pedro Oliveira", department: "Vendas" },
    content: 'Enviou kudos para Carlos: "Excelente apresentação!"',
    reactions: [
      { emoji: "❤️", count: 9, reacted: false },
      { emoji: "🙌", count: 6, reacted: true }
    ],
    timestamp: new Date(Date.now() - 45 * 60 * 1000)
  },
  {
    id: "5",
    type: "streak",
    user: { name: "Fernanda Lima", department: "Financeiro" },
    content: "Atingiu 30 dias de streak!",
    metadata: { streak: 30, xp: 500 },
    reactions: [
      { emoji: "🔥", count: 20, reacted: true },
      { emoji: "🎯", count: 8, reacted: false }
    ],
    timestamp: new Date(Date.now() - 60 * 60 * 1000)
  },
  {
    id: "6",
    type: "learning",
    user: { name: "Lucas Mendes", department: "Operações" },
    content: 'Completou a trilha "Liderança Eficaz"',
    metadata: { xp: 800 },
    reactions: [
      { emoji: "📚", count: 5, reacted: false },
      { emoji: "🧠", count: 3, reacted: false }
    ],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: "7",
    type: "milestone",
    user: { name: "Carla Rocha", department: "Produto" },
    content: "Completou 1 ano na empresa!",
    metadata: { xp: 1000 },
    reactions: [
      { emoji: "🎂", count: 25, reacted: true },
      { emoji: "🎈", count: 15, reacted: false },
      { emoji: "🥳", count: 12, reacted: false }
    ],
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
  }
];

const typeConfig = {
  achievement: { icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/20" },
  level_up: { icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/20" },
  quest: { icon: Target, color: "text-blue-500", bg: "bg-blue-500/20" },
  kudos: { icon: Heart, color: "text-rose-500", bg: "bg-rose-500/20" },
  milestone: { icon: PartyPopper, color: "text-purple-500", bg: "bg-purple-500/20" },
  learning: { icon: BookOpen, color: "text-cyan-500", bg: "bg-cyan-500/20" },
  streak: { icon: Flame, color: "text-orange-500", bg: "bg-orange-500/20" }
};

const ActivityCard = memo(({ activity, onReact }: { 
  activity: ActivityItem; 
  onReact: (activityId: string, emoji: string) => void;
}) => {
  const config = typeConfig[activity.type];
  const Icon = config.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-card border hover:bg-accent/30 transition-colors"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="h-10 w-10">
          <AvatarImage src={activity.user.avatar} />
          <AvatarFallback className="text-sm">
            {activity.user.name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">{activity.user.name}</span>
            <Badge variant="outline" className="text-[10px] px-1 py-0">
              {activity.user.department}
            </Badge>
          </div>
          
          {/* Content */}
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1 rounded ${config.bg}`}>
              <Icon className={`h-3.5 w-3.5 ${config.color}`} />
            </div>
            <p className="text-sm text-muted-foreground">{activity.content}</p>
          </div>
          
          {/* Metadata */}
          {activity.metadata?.xp && (
            <Badge variant="secondary" className="text-xs mb-2">
              <Zap className="h-3 w-3 mr-1 text-amber-500" />
              +{activity.metadata.xp} XP
            </Badge>
          )}
          
          {/* Reactions & Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {activity.reactions.map((reaction, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onReact(activity.id, reaction.emoji)}
                  className={`
                    flex items-center gap-1 px-2 py-1 rounded-full text-xs
                    ${reaction.reacted 
                      ? "bg-primary/20 text-primary" 
                      : "bg-muted hover:bg-muted/80"}
                    transition-colors
                  `}
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </motion.button>
              ))}
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                <span className="text-sm">+</span>
              </Button>
            </div>
            
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(activity.timestamp, { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

ActivityCard.displayName = "ActivityCard";

const TeamActivityFeed = memo(({ className }: { className?: string }) => {
  const [activityList, setActivityList] = useState(activities);
  const [filter, setFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const filteredActivities = useMemo(() => {
    if (filter === "all") return activityList;
    return activityList.filter(a => a.type === filter);
  }, [activityList, filter]);
  
  const handleReact = (activityId: string, emoji: string) => {
    setActivityList(prev => prev.map(activity => {
      if (activity.id !== activityId) return activity;
      
      return {
        ...activity,
        reactions: activity.reactions.map(r => {
          if (r.emoji !== emoji) return r;
          return {
            ...r,
            count: r.reacted ? r.count - 1 : r.count + 1,
            reacted: !r.reacted
          };
        })
      };
    }));
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };
  
  const stats = useMemo(() => {
    return {
      total: activityList.length,
      achievements: activityList.filter(a => a.type === "achievement").length,
      levelUps: activityList.filter(a => a.type === "level_up").length,
      kudos: activityList.filter(a => a.type === "kudos").length
    };
  }, [activityList]);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              <Activity className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Atividades da Equipe</CardTitle>
              <p className="text-xs text-muted-foreground">
                {stats.total} atividades recentes
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-2 mt-3">
          <Badge variant="outline" className="text-xs">
            <Trophy className="h-3 w-3 mr-1 text-amber-500" />
            {stats.achievements} conquistas
          </Badge>
          <Badge variant="outline" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            {stats.levelUps} level ups
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Heart className="h-3 w-3 mr-1 text-rose-500" />
            {stats.kudos} kudos
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="shrink-0"
          >
            Todas
          </Button>
          {Object.entries(typeConfig).map(([type, config]) => {
            const Icon = config.icon;
            return (
              <Button
                key={type}
                variant={filter === type ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(type)}
                className="shrink-0"
              >
                <Icon className={`h-3 w-3 mr-1 ${filter === type ? "" : config.color}`} />
                {type === "achievement" ? "Conquistas" :
                 type === "level_up" ? "Level Up" :
                 type === "quest" ? "Missões" :
                 type === "kudos" ? "Kudos" :
                 type === "milestone" ? "Marcos" :
                 type === "learning" ? "Aprendizado" : "Streak"}
              </Button>
            );
          })}
        </div>
        
        {/* Activity List */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onReact={handleReact}
                />
              ))}
            </AnimatePresence>
            
            {filteredActivities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma atividade encontrada</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Load More */}
        <div className="text-center pt-2 border-t">
          <Button variant="ghost" size="sm">
            Carregar mais atividades
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

TeamActivityFeed.displayName = "TeamActivityFeed";

export { TeamActivityFeed };
