import { memo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Timer, Zap, Target, Star, TrendingUp, Clock, CheckCircle2, Play, Pause, 
  RotateCcw, Flame, Trophy, Coffee, Brain, Rocket, ChevronRight, Gift,
  Volume2, VolumeX, Settings, Maximize2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface SprintGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  xpReward: number;
  icon: React.ElementType;
}

const mockGoals: SprintGoal[] = [
  { id: "1", title: "Tarefas Completadas", target: 10, current: 7, unit: "tarefas", xpReward: 200, icon: CheckCircle2 },
  { id: "2", title: "Horas Focadas", target: 8, current: 5.5, unit: "horas", xpReward: 150, icon: Brain },
  { id: "3", title: "Reuniões Produtivas", target: 5, current: 5, unit: "reuniões", xpReward: 100, icon: Target },
];

const timerModes = [
  { id: "focus", label: "Foco", duration: 25, color: "from-cyan-500 to-blue-500", icon: Brain },
  { id: "short", label: "Pausa Curta", duration: 5, color: "from-green-500 to-emerald-500", icon: Coffee },
  { id: "long", label: "Pausa Longa", duration: 15, color: "from-purple-500 to-pink-500", icon: Rocket },
];

export const SprintTimer = memo(function SprintTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentMode, setCurrentMode] = useState(timerModes[0]);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [sessions, setSessions] = useState(4);
  const [streak, setStreak] = useState(3);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showPulse, setShowPulse] = useState(false);
  const [xpEarned, setXpEarned] = useState(450);
  const [multiplier, setMultiplier] = useState(1.5);

  const totalTime = currentMode.duration * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 3000);
      // Auto switch to break
      if (currentMode.id === "focus") {
        setXpEarned(prev => prev + 50);
        setSessions(prev => prev + 1);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, currentMode.id]);

  const toggleTimer = useCallback(() => {
    setIsRunning(!isRunning);
  }, [isRunning]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(currentMode.duration * 60);
  }, [currentMode.duration]);

  const changeMode = useCallback((mode: typeof timerModes[0]) => {
    setCurrentMode(mode);
    setTimeLeft(mode.duration * 60);
    setIsRunning(false);
  }, []);

  const sprintProgress = 68;
  const potentialXP = 650;
  const completedGoals = mockGoals.filter(g => g.current >= g.target).length;

  return (
    <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-background via-background to-cyan-500/5 relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className={cn("absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-30 bg-gradient-to-br", currentMode.color)}
          animate={{
            scale: isRunning ? [1, 1.2, 1] : 1,
            opacity: isRunning ? [0.3, 0.5, 0.3] : 0.2,
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Completion Pulse */}
      <AnimatePresence>
        {showPulse && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          />
        )}
      </AnimatePresence>

      <CardHeader className="pb-3 relative">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: isRunning ? 360 : 0 }}
              transition={{ duration: 60, repeat: isRunning ? Infinity : 0, ease: "linear" }}
              className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br", currentMode.color)}
            >
              <Timer className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">Sprint Timer</span>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1">
                  <Flame className="h-3 w-3" />
                  {streak} streak
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">Sprint Semanal #12 • Sessão {sessions}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSoundEnabled(!soundEnabled)}>
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 relative">
        {/* Mode Selector */}
        <div className="flex gap-2 p-1 bg-muted/50 rounded-xl">
          {timerModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <motion.button
                key={mode.id}
                onClick={() => changeMode(mode)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                  currentMode.id === mode.id
                    ? "bg-background shadow-md"
                    : "hover:bg-background/50"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className={cn("h-4 w-4", currentMode.id === mode.id && "text-primary")} />
                <span className="hidden sm:inline">{mode.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Timer Display */}
        <motion.div
          className={cn(
            "relative p-8 rounded-3xl text-center overflow-hidden",
            "bg-gradient-to-br border border-white/10",
            currentMode.color.replace("from-", "from-").replace("to-", "to-") + "/10"
          )}
        >
          {/* Circular Progress */}
          <div className="relative w-48 h-48 mx-auto mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted/30"
              />
              <motion.circle
                cx="96"
                cy="96"
                r="88"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={553}
                initial={{ strokeDashoffset: 553 }}
                animate={{ strokeDashoffset: 553 - (553 * progress) / 100 }}
                transition={{ duration: 0.5 }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Time Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                className="text-5xl font-mono font-bold tracking-tight"
                animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
                transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
              >
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </motion.div>
              <p className="text-sm text-muted-foreground mt-1">{currentMode.label}</p>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-3">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={resetTimer}
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className={cn(
                  "h-16 w-16 rounded-full shadow-lg transition-all",
                  "bg-gradient-to-br",
                  currentMode.color,
                  isRunning && "shadow-xl"
                )}
                onClick={toggleTimer}
              >
                {isRunning ? (
                  <Pause className="h-7 w-7 text-white" />
                ) : (
                  <Play className="h-7 w-7 text-white ml-1" />
                )}
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
              >
                <Maximize2 className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>

          {/* Multiplier Badge */}
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 right-4"
            >
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1 shadow-lg">
                <Zap className="h-3 w-3" />
                {multiplier}x XP
              </Badge>
            </motion.div>
          )}
        </motion.div>

        {/* XP Progress */}
        <motion.div 
          className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20"
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">XP do Sprint</p>
                <p className="text-xs text-muted-foreground">Potencial: +{potentialXP} XP</p>
              </div>
            </div>
            <div className="text-right">
              <motion.p 
                className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent"
                key={xpEarned}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                {xpEarned}
              </motion.p>
              <p className="text-xs text-muted-foreground">de {potentialXP} XP</p>
            </div>
          </div>
          <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(xpEarned / potentialXP) * 100}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </motion.div>

        {/* Sprint Goals */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Metas do Sprint
            </h4>
            <Badge variant="outline" className="gap-1">
              <Trophy className="h-3 w-3 text-amber-500" />
              {completedGoals}/{mockGoals.length}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {mockGoals.map((goal, index) => {
              const goalProgress = Math.min((goal.current / goal.target) * 100, 100);
              const isComplete = goal.current >= goal.target;
              const Icon = goal.icon;
              
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all",
                    isComplete 
                      ? "bg-gradient-to-r from-green-500/10 to-emerald-500/5 border-green-500/40" 
                      : "bg-muted/30 border-transparent hover:border-primary/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      isComplete 
                        ? "bg-gradient-to-br from-green-500 to-emerald-400 shadow-lg shadow-green-500/30"
                        : "bg-muted"
                    )}>
                      {isComplete ? (
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      ) : (
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{goal.title}</span>
                        <Badge variant="secondary" className="text-[10px] gap-1">
                          <Gift className="h-3 w-3 text-amber-500" />
                          +{goal.xpReward} XP
                        </Badge>
                      </div>
                      <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
                        <motion.div
                          className={cn(
                            "absolute inset-y-0 left-0 rounded-full",
                            isComplete 
                              ? "bg-gradient-to-r from-green-500 to-emerald-400"
                              : "bg-gradient-to-r from-cyan-500 to-blue-500"
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${goalProgress}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                        <span>{goal.current}/{goal.target} {goal.unit}</span>
                        <span className={cn(isComplete && "text-green-500 font-medium")}>
                          {Math.round(goalProgress)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 pt-4 border-t">
          {[
            { icon: TrendingUp, value: "+15%", label: "vs anterior", color: "text-green-500" },
            { icon: Target, value: `${completedGoals}/${mockGoals.length}`, label: "metas", color: "text-blue-500" },
            { icon: Zap, value: `${multiplier}x`, label: "multi", color: "text-amber-500" },
            { icon: Flame, value: streak.toString(), label: "streak", color: "text-orange-500" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-2 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <stat.icon className={cn("h-5 w-5 mx-auto mb-1", stat.color)} />
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Action Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button className={cn(
            "w-full h-12 gap-2 shadow-lg text-white",
            "bg-gradient-to-r",
            currentMode.color
          )}>
            <Rocket className="h-5 w-5" />
            Ver Relatório Completo
            <ChevronRight className="h-5 w-5" />
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
});
