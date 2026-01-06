import { memo } from "react";
import { motion } from "framer-motion";
import { 
  Target, 
  BookOpen, 
  Trophy, 
  Flame, 
  TrendingUp,
  Star,
  Award,
  CheckCircle2,
  Clock,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProgressItem {
  id: string;
  label: string;
  current: number;
  total: number;
  icon: React.ReactNode;
  color: string;
  trend?: number;
}

interface UnifiedProgressDashboardProps {
  className?: string;
  // Data from various sources
  goals?: { completed: number; total: number; trend?: number };
  trails?: { completed: number; total: number; modulesCompleted?: number };
  quests?: { completed: number; total: number; active: number };
  achievements?: { unlocked: number; total: number };
  streak?: { current: number; best: number };
  xp?: { current: number; nextLevel: number; level: number };
}

/**
 * UnifiedProgressDashboard - Consolidated view of user progress
 */
export const UnifiedProgressDashboard = memo(function UnifiedProgressDashboard({
  className,
  goals = { completed: 0, total: 0 },
  trails = { completed: 0, total: 0 },
  quests = { completed: 0, total: 0, active: 0 },
  achievements = { unlocked: 0, total: 0 },
  streak = { current: 0, best: 0 },
  xp = { current: 0, nextLevel: 100, level: 1 },
}: UnifiedProgressDashboardProps) {
  
  const progressItems: ProgressItem[] = [
    {
      id: "goals",
      label: "Metas",
      current: goals.completed,
      total: goals.total,
      icon: <Target className="h-4 w-4" />,
      color: "text-blue-500",
      trend: goals.trend,
    },
    {
      id: "trails",
      label: "Trilhas",
      current: trails.completed,
      total: trails.total,
      icon: <BookOpen className="h-4 w-4" />,
      color: "text-emerald-500",
    },
    {
      id: "quests",
      label: "Quests",
      current: quests.completed,
      total: quests.total,
      icon: <Trophy className="h-4 w-4" />,
      color: "text-amber-500",
    },
    {
      id: "achievements",
      label: "Conquistas",
      current: achievements.unlocked,
      total: achievements.total,
      icon: <Award className="h-4 w-4" />,
      color: "text-purple-500",
    },
  ];

  const xpProgress = xp.nextLevel > 0 ? (xp.current / xp.nextLevel) * 100 : 0;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Progresso Unificado
          </CardTitle>
          <Badge variant="secondary" className="gap-1">
            <Star className="h-3 w-3 fill-current" />
            Nível {xp.level}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* XP Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-yellow-500" />
              Progresso de XP
            </span>
            <span className="font-medium">
              {xp.current.toLocaleString()} / {xp.nextLevel.toLocaleString()} XP
            </span>
          </div>
          <div className="relative">
            <Progress value={xpProgress} className="h-3" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              style={{ width: "50%" }}
            />
          </div>
        </div>

        {/* Streak & Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20"
          >
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-500">{streak.current}</p>
              <p className="text-xs text-muted-foreground">Dias de streak</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20"
          >
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">{quests.active}</p>
              <p className="text-xs text-muted-foreground">Quests ativas</p>
            </div>
          </motion.div>
        </div>

        {/* Progress Grid */}
        <div className="space-y-3">
          {progressItems.map((item, index) => {
            const percentage = item.total > 0 ? (item.current / item.total) * 100 : 0;
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className={item.color}>{item.icon}</span>
                    {item.label}
                  </span>
                  <span className="font-medium flex items-center gap-2">
                    {item.current}/{item.total}
                    {item.trend !== undefined && item.trend !== 0 && (
                      <Badge
                        variant={item.trend > 0 ? "default" : "destructive"}
                        className="text-[10px] px-1 py-0"
                      >
                        {item.trend > 0 ? "+" : ""}{item.trend}%
                      </Badge>
                    )}
                  </span>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2"
                />
              </motion.div>
            );
          })}
        </div>

        {/* Upcoming Deadlines */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Clock className="h-4 w-4" />
            Próximos prazos
          </div>
          <div className="text-xs text-muted-foreground italic">
            Nenhum prazo próximo
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
