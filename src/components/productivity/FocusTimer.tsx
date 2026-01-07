import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Timer, Play, Pause, RotateCcw, Coffee, Brain, 
  Zap, Target, TrendingUp, Volume2, VolumeX 
} from "lucide-react";

type TimerMode = "focus" | "shortBreak" | "longBreak";

const timerConfig: Record<TimerMode, { duration: number; label: string; color: string }> = {
  focus: { duration: 25 * 60, label: "Foco", color: "from-primary to-primary/70" },
  shortBreak: { duration: 5 * 60, label: "Pausa Curta", color: "from-green-500 to-emerald-500" },
  longBreak: { duration: 15 * 60, label: "Pausa Longa", color: "from-blue-500 to-cyan-500" }
};

export function FocusTimer() {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(timerConfig.focus.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dailyStats] = useState({ focusTime: 120, sessions: 5, streak: 3 });

  const totalDuration = timerConfig[mode].duration;
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleComplete = useCallback(() => {
    setIsRunning(false);
    if (mode === "focus") {
      setCompletedSessions(prev => prev + 1);
      // Auto-switch to break
      if ((completedSessions + 1) % 4 === 0) {
        setMode("longBreak");
        setTimeLeft(timerConfig.longBreak.duration);
      } else {
        setMode("shortBreak");
        setTimeLeft(timerConfig.shortBreak.duration);
      }
    } else {
      // Back to focus after break
      setMode("focus");
      setTimeLeft(timerConfig.focus.duration);
    }
  }, [mode, completedSessions]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, handleComplete]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(timerConfig[mode].duration);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(timerConfig[newMode].duration);
    setIsRunning(false);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg">
            <Timer className="h-5 w-5 text-primary" />
            Focus Timer
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode Selector */}
        <div className="flex gap-2">
          {(Object.keys(timerConfig) as TimerMode[]).map((m) => (
            <Button
              key={m}
              variant={mode === m ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => switchMode(m)}
            >
              {m === "focus" && <Brain className="h-3 w-3 mr-1" />}
              {m === "shortBreak" && <Coffee className="h-3 w-3 mr-1" />}
              {m === "longBreak" && <Coffee className="h-3 w-3 mr-1" />}
              {timerConfig[m].label}
            </Button>
          ))}
        </div>

        {/* Timer Display */}
        <div className="relative">
          <motion.div
            className={`
              relative p-8 rounded-2xl bg-gradient-to-br ${timerConfig[mode].color}
              flex flex-col items-center justify-center
            `}
            animate={isRunning ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* Circular Progress */}
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-white/20"
                />
                <motion.circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="text-white"
                  strokeDasharray={2 * Math.PI * 88}
                  strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
                  initial={false}
                  animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - progress / 100) }}
                  transition={{ duration: 0.5 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <span className="text-5xl font-bold font-mono">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-sm opacity-80 mt-1">
                  {timerConfig[mode].label}
                </span>
              </div>
            </div>

            {/* Pulse Animation when running */}
            <AnimatePresence>
              {isRunning && (
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-white/30"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.05, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          <Button variant="outline" size="icon" onClick={resetTimer}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button size="lg" className="w-32" onClick={toggleTimer}>
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pausar
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Iniciar
              </>
            )}
          </Button>
        </div>

        {/* Sessions Counter */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4].map((session) => (
            <motion.div
              key={session}
              className={`
                w-3 h-3 rounded-full
                ${session <= completedSessions % 4 || (completedSessions > 0 && completedSessions % 4 === 0)
                  ? "bg-primary"
                  : "bg-muted"
                }
              `}
              animate={session === (completedSessions % 4) + 1 && isRunning ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
          ))}
        </div>

        {/* Daily Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary">
              <Zap className="h-4 w-4" />
              <span className="font-bold">{dailyStats.focusTime}m</span>
            </div>
            <p className="text-xs text-muted-foreground">Tempo Foco</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary">
              <Target className="h-4 w-4" />
              <span className="font-bold">{dailyStats.sessions}</span>
            </div>
            <p className="text-xs text-muted-foreground">Sessões</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary">
              <TrendingUp className="h-4 w-4" />
              <span className="font-bold">{dailyStats.streak} dias</span>
            </div>
            <p className="text-xs text-muted-foreground">Sequência</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
