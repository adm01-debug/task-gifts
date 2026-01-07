import React, { memo, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Repeat, Zap, Star, Flame, Calendar, TrendingUp, 
  CheckCircle2, Gift, Trophy, Target, Sparkles, Clock
} from "lucide-react";

interface ComboData {
  currentCombo: number;
  maxCombo: number;
  multiplier: number;
  actions: {
    id: string;
    name: string;
    icon: React.ElementType;
    completed: boolean;
    xpBonus: number;
  }[];
  timeRemaining: number;
  streakDays: number;
}

const mockComboData: ComboData = {
  currentCombo: 4,
  maxCombo: 6,
  multiplier: 2.5,
  actions: [
    { id: "1", name: "Check-in", icon: CheckCircle2, completed: true, xpBonus: 50 },
    { id: "2", name: "Tarefa", icon: Target, completed: true, xpBonus: 75 },
    { id: "3", name: "Kudos", icon: Star, completed: true, xpBonus: 30 },
    { id: "4", name: "Trilha", icon: TrendingUp, completed: true, xpBonus: 100 },
    { id: "5", name: "Quiz", icon: Zap, completed: false, xpBonus: 50 },
    { id: "6", name: "Feedback", icon: Gift, completed: false, xpBonus: 40 }
  ],
  timeRemaining: 14400,
  streakDays: 15
};

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const ComboMultiplier = memo(({ className }: { className?: string }) => {
  const [data] = useState(mockComboData);
  const [showDetails, setShowDetails] = useState(false);
  
  const progress = (data.currentCombo / data.maxCombo) * 100;
  const earnedXp = useMemo(() => {
    return data.actions
      .filter(a => a.completed)
      .reduce((sum, a) => sum + a.xpBonus, 0);
  }, [data.actions]);
  
  const totalXpWithMultiplier = Math.round(earnedXp * data.multiplier);
  
  const comboColor = useMemo(() => {
    if (data.currentCombo >= 5) return "text-amber-500";
    if (data.currentCombo >= 3) return "text-purple-500";
    return "text-blue-500";
  }, [data.currentCombo]);

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {data.currentCombo >= 4 && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-purple-500/5"
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.02, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>
      
      <CardHeader className="pb-2 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div 
              className={`p-2 rounded-lg ${data.currentCombo >= 4 ? "bg-amber-500/20" : "bg-primary/20"}`}
              animate={data.currentCombo >= 4 ? { rotate: [0, 5, -5, 0] } : {}}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <Repeat className={`h-5 w-5 ${comboColor}`} />
            </motion.div>
            <div>
              <CardTitle className="text-lg">Combo Diário</CardTitle>
              <p className="text-xs text-muted-foreground">
                Complete ações para multiplicar XP
              </p>
            </div>
          </div>
          
          {/* Multiplier Badge */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Badge 
              className={`text-lg px-3 py-1 ${
                data.multiplier >= 2 
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white" 
                  : "bg-primary"
              }`}
            >
              <Zap className="h-4 w-4 mr-1" />
              {data.multiplier}x
            </Badge>
          </motion.div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 relative">
        {/* Combo Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <Flame className={`h-4 w-4 ${comboColor}`} />
              <span className="font-semibold">{data.currentCombo}/{data.maxCombo} Combo</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatTime(data.timeRemaining)} restantes
            </div>
          </div>
          
          <div className="relative">
            <Progress value={progress} className="h-3" />
            
            {/* Combo Markers */}
            <div className="absolute inset-0 flex">
              {[...Array(data.maxCombo)].map((_, i) => (
                <div 
                  key={i}
                  className="flex-1 flex items-center justify-center"
                >
                  {i < data.currentCombo ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`h-5 w-5 rounded-full flex items-center justify-center ${
                        i === data.currentCombo - 1 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-primary/80 text-primary-foreground"
                      }`}
                    >
                      <Sparkles className="h-3 w-3" />
                    </motion.div>
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 bg-background" />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Multiplier Stages */}
          <div className="flex justify-between mt-2 text-xs">
            <span className="text-muted-foreground">1x</span>
            <span className="text-blue-500">1.5x</span>
            <span className="text-purple-500">2x</span>
            <span className="text-amber-500">2.5x</span>
            <span className="text-orange-500">3x</span>
            <span className="text-rose-500">4x</span>
          </div>
        </div>
        
        {/* Actions Grid */}
        <div className="grid grid-cols-3 gap-2">
          {data.actions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.id}
                whileHover={{ scale: 1.02 }}
                className={`
                  relative p-3 rounded-lg border text-center
                  ${action.completed 
                    ? "bg-green-500/10 border-green-500/30" 
                    : "bg-muted/50 border-border"}
                `}
              >
                <Icon className={`h-5 w-5 mx-auto mb-1 ${
                  action.completed ? "text-green-500" : "text-muted-foreground"
                }`} />
                <span className="text-xs font-medium">{action.name}</span>
                
                {action.completed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </motion.div>
                )}
                
                <Badge 
                  variant="outline" 
                  className={`text-[10px] mt-1 ${
                    action.completed ? "text-green-500" : ""
                  }`}
                >
                  +{action.xpBonus} XP
                </Badge>
              </motion.div>
            );
          })}
        </div>
        
        {/* XP Summary */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-muted-foreground">XP Ganho Hoje</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{earnedXp}</span>
                <span className="text-muted-foreground">→</span>
                <span className={`text-xl font-bold ${comboColor}`}>
                  {totalXpWithMultiplier} XP
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="font-bold">{data.streakDays}</span>
              </div>
              <span className="text-xs text-muted-foreground">dias de streak</span>
            </div>
          </div>
        </div>
        
        {/* Action Button */}
        {data.currentCombo < data.maxCombo && (
          <Button className="w-full" onClick={() => setShowDetails(!showDetails)}>
            <Target className="h-4 w-4 mr-2" />
            Completar Próxima Ação
          </Button>
        )}
        
        {data.currentCombo === data.maxCombo && (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="p-4 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-center"
          >
            <Trophy className="h-8 w-8 mx-auto text-amber-500 mb-2" />
            <h3 className="font-bold text-amber-500">Combo Máximo!</h3>
            <p className="text-sm text-muted-foreground">
              Você está ganhando 4x XP em todas as atividades!
            </p>
          </motion.div>
        )}
        
        {/* Streak Bonus Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Streak de {data.streakDays} dias = +{Math.min(data.streakDays * 2, 50)}% XP bônus
          </span>
          <Button variant="ghost" size="sm" className="h-6 text-xs">
            Ver histórico
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

ComboMultiplier.displayName = "ComboMultiplier";

export { ComboMultiplier };
