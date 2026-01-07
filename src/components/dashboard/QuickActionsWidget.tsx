import React, { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, CheckCircle, BookOpen, MessageSquare, Target,
  Calendar, Users, TrendingUp, Gift, Bell, Settings,
  ChevronRight, Sparkles, Zap, Heart, Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  href?: string;
  action?: () => void;
  badge?: string;
  badgeColor?: string;
  xpReward?: number;
  isPriority?: boolean;
}

const quickActions: QuickAction[] = [
  {
    id: "checkin",
    title: "Check-in Diário",
    description: "Registre sua presença",
    icon: Clock,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    xpReward: 50,
    isPriority: true,
    badge: "Pendente"
  },
  {
    id: "training",
    title: "Continuar Treinamento",
    description: "React Avançado - Módulo 3",
    icon: BookOpen,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    xpReward: 100,
    badge: "75%"
  },
  {
    id: "feedback",
    title: "Dar Feedback",
    description: "3 solicitações pendentes",
    icon: MessageSquare,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    badge: "3",
    badgeColor: "bg-purple-500"
  },
  {
    id: "goals",
    title: "Atualizar Metas",
    description: "2 metas para revisar",
    icon: Target,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10"
  },
  {
    id: "kudos",
    title: "Enviar Kudos",
    description: "Reconheça um colega",
    icon: Heart,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    xpReward: 25
  },
  {
    id: "calendar",
    title: "Agenda do Dia",
    description: "3 reuniões hoje",
    icon: Calendar,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    badge: "3"
  }
];

const suggestedActions = [
  { id: "1", title: "Complete o quiz semanal", xp: 150, icon: "🎯", deadline: "2h restantes" },
  { id: "2", title: "Avalie o treinamento anterior", xp: 50, icon: "⭐", deadline: "Hoje" },
  { id: "3", title: "Participe do challenge da semana", xp: 300, icon: "🏆", deadline: "3 dias" }
];

const QuickActionCard: React.FC<{ action: QuickAction; index: number }> = memo(({ action, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = action.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative p-4 rounded-xl border cursor-pointer transition-all duration-300",
        "hover:shadow-lg hover:border-primary/30",
        action.isPriority && "ring-2 ring-green-500/30 bg-green-500/5"
      )}
    >
      {/* Priority Indicator */}
      {action.isPriority && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
        />
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <motion.div
          animate={isHovered ? { rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 0.3 }}
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
            action.bgColor
          )}
        >
          <Icon className={cn("h-6 w-6", action.color)} />
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold truncate">{action.title}</h4>
            {action.badge && (
              <Badge 
                className={cn(
                  "shrink-0",
                  action.badgeColor || "bg-muted"
                )}
                variant="secondary"
              >
                {action.badge}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{action.description}</p>
          
          {action.xpReward && (
            <div className="flex items-center gap-1 mt-2 text-xs text-yellow-600">
              <Star className="h-3 w-3" />
              <span>+{action.xpReward} XP</span>
            </div>
          )}
        </div>

        {/* Arrow */}
        <motion.div
          animate={isHovered ? { x: 5 } : { x: 0 }}
          className="shrink-0 self-center"
        >
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </div>
    </motion.div>
  );
});

QuickActionCard.displayName = "QuickActionCard";

const SuggestedActionChip: React.FC<{ action: typeof suggestedActions[0]; index: number }> = memo(({ action, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 cursor-pointer hover:border-primary/40 transition-colors"
    >
      <span className="text-xl">{action.icon}</span>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium truncate block">{action.title}</span>
        <span className="text-xs text-muted-foreground">{action.deadline}</span>
      </div>
      <Badge variant="outline" className="shrink-0 text-xs">
        +{action.xp} XP
      </Badge>
    </motion.div>
  );
});

SuggestedActionChip.displayName = "SuggestedActionChip";

export const QuickActionsWidget: React.FC<{ className?: string }> = memo(({ className }) => {
  const pendingCount = quickActions.filter(a => a.badge === "Pendente").length;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            {pendingCount > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5">
                {pendingCount}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Quick Actions */}
        <div className="grid gap-3 md:grid-cols-2">
          {quickActions.slice(0, 4).map((action, i) => (
            <QuickActionCard key={action.id} action={action} index={i} />
          ))}
        </div>

        {/* More Actions Row */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {quickActions.slice(4).map((action, i) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              className="shrink-0 gap-2"
            >
              <action.icon className={cn("h-4 w-4", action.color)} />
              {action.title}
              {action.badge && (
                <Badge variant="secondary" className="ml-1">
                  {action.badge}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* AI Suggestions */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Sugestões para Você</span>
          </div>
          <div className="space-y-2">
            {suggestedActions.map((action, i) => (
              <SuggestedActionChip key={action.id} action={action} index={i} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

QuickActionsWidget.displayName = "QuickActionsWidget";
