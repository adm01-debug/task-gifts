import { memo, useState, useCallback, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Focus, X, Clock, Target, Zap, Play, Pause, 
  RotateCcw, CheckCircle, Coffee, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Focus Mode Context
interface FocusModeContextType {
  isActive: boolean;
  currentTask: string | null;
  timeRemaining: number;
  totalTime: number;
  isPaused: boolean;
  sessionsCompleted: number;
  startFocusSession: (task: string, duration: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: (completed?: boolean) => void;
}

const FocusModeContext = createContext<FocusModeContextType | null>(null);

export const useFocusMode = () => {
  const context = useContext(FocusModeContext);
  if (!context) {
    throw new Error("useFocusMode must be used within FocusModeProvider");
  }
  return context;
};

export const useFocusModeSafe = () => {
  return useContext(FocusModeContext);
};

// Provider
export const FocusModeProvider = memo(function FocusModeProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [isActive, setIsActive] = useState(false);
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Timer logic
  useEffect(() => {
    if (!isActive || isPaused || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          setSessionsCompleted((s) => s + 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, timeRemaining]);

  const startFocusSession = useCallback((task: string, duration: number) => {
    setCurrentTask(task);
    setTotalTime(duration);
    setTimeRemaining(duration);
    setIsActive(true);
    setIsPaused(false);
  }, []);

  const pauseSession = useCallback(() => setIsPaused(true), []);
  const resumeSession = useCallback(() => setIsPaused(false), []);

  const endSession = useCallback((completed = false) => {
    if (completed) {
      setSessionsCompleted((s) => s + 1);
    }
    setIsActive(false);
    setCurrentTask(null);
    setTimeRemaining(0);
  }, []);

  return (
    <FocusModeContext.Provider
      value={{
        isActive,
        currentTask,
        timeRemaining,
        totalTime,
        isPaused,
        sessionsCompleted,
        startFocusSession,
        pauseSession,
        resumeSession,
        endSession,
      }}
    >
      {children}
      <FocusModeOverlay />
    </FocusModeContext.Provider>
  );
});

// Focus Mode Overlay
const FocusModeOverlay = memo(function FocusModeOverlay() {
  const focusMode = useFocusModeSafe();
  
  if (!focusMode?.isActive) return null;

  const { 
    currentTask, 
    timeRemaining, 
    totalTime, 
    isPaused,
    sessionsCompleted,
    pauseSession, 
    resumeSession, 
    endSession 
  } = focusMode;

  const progress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-md flex items-center justify-center"
      >
        {/* Ambient background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.1, 1, 1.1],
              opacity: [0.15, 0.1, 0.15],
            }}
            transition={{ duration: 8, repeat: Infinity, delay: 4 }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          />
        </div>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => endSession(false)}
          className="absolute top-6 right-6 text-muted-foreground hover:text-foreground"
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Main content */}
        <div className="relative z-10 text-center max-w-lg px-4">
          {/* Focus icon */}
          <motion.div
            animate={{ 
              scale: isPaused ? 1 : [1, 1.05, 1],
              rotate: isPaused ? 0 : [0, 2, -2, 0],
            }}
            transition={{ 
              duration: 4, 
              repeat: isPaused ? 0 : Infinity,
              ease: "easeInOut"
            }}
            className="mx-auto mb-8"
          >
            <div className={cn(
              "w-32 h-32 rounded-full flex items-center justify-center",
              "bg-gradient-to-br from-primary/20 to-purple-500/20",
              "border-2 border-primary/30"
            )}>
              <Focus className={cn(
                "w-16 h-16",
                isPaused ? "text-muted-foreground" : "text-primary"
              )} />
            </div>
          </motion.div>

          {/* Timer */}
          <motion.div
            key={timeRemaining}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="mb-4"
          >
            <span className={cn(
              "text-7xl font-mono font-bold tracking-tight",
              isPaused ? "text-muted-foreground" : "text-foreground"
            )}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </motion.div>

          {/* Progress */}
          <div className="mb-6">
            <Progress value={progress} className="h-2 bg-muted/50" />
          </div>

          {/* Current task */}
          <p className="text-xl text-foreground font-medium mb-2">
            {currentTask}
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            {isPaused ? "Sessão pausada" : "Mantenha o foco!"}
          </p>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => endSession(false)}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reiniciar
            </Button>

            <Button
              size="lg"
              onClick={isPaused ? resumeSession : pauseSession}
              className="gap-2 min-w-32"
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4" />
                  Continuar
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" />
                  Pausar
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => endSession(true)}
              className="gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Concluir
            </Button>
          </div>

          {/* Sessions completed */}
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span>{sessionsCompleted} sessões concluídas hoje</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

// Focus Mode Trigger Component
interface FocusModeTriggerProps {
  className?: string;
  compact?: boolean;
}

export const FocusModeTrigger = memo(function FocusModeTrigger({ 
  className,
  compact = false
}: FocusModeTriggerProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(25);
  const focusMode = useFocusModeSafe();

  const durations = [
    { value: 15, label: "15 min", icon: Coffee },
    { value: 25, label: "25 min", icon: Target },
    { value: 45, label: "45 min", icon: Zap },
    { value: 60, label: "60 min", icon: Focus },
  ];

  const quickTasks = [
    "Completar quiz diário",
    "Revisar metas semanais",
    "Estudar trilha de aprendizado",
    "Responder feedbacks",
  ];

  const handleStart = () => {
    if (selectedTask && focusMode) {
      focusMode.startFocusSession(selectedTask, selectedDuration * 60);
      setShowModal(false);
      setSelectedTask("");
    }
  };

  if (compact) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowModal(true)}
        className={cn("gap-2", className)}
      >
        <Focus className="w-4 h-4" />
        <span className="hidden sm:inline">Modo Foco</span>
      </Button>
    );
  }

  return (
    <>
      <Card 
        className={cn(
          "p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
          className
        )}
        onClick={() => setShowModal(true)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Focus className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">Modo Foco</h4>
            <p className="text-xs text-muted-foreground">
              Concentre-se sem distrações
            </p>
          </div>
          <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {focusMode?.sessionsCompleted || 0} hoje
          </div>
        </div>
      </Card>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Focus className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">Iniciar Modo Foco</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowModal(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Task input */}
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">
                    No que você vai focar?
                  </label>
                  <input
                    type="text"
                    value={selectedTask}
                    onChange={(e) => setSelectedTask(e.target.value)}
                    placeholder="Ex: Completar módulo de treinamento"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Quick tasks */}
                <div className="mb-6">
                  <p className="text-xs text-muted-foreground mb-2">Sugestões:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickTasks.map((task) => (
                      <button
                        key={task}
                        onClick={() => setSelectedTask(task)}
                        className={cn(
                          "text-xs px-3 py-1.5 rounded-full transition-colors",
                          selectedTask === task
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {task}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration selection */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">
                    Duração
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {durations.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setSelectedDuration(value)}
                        className={cn(
                          "flex flex-col items-center gap-1 p-3 rounded-lg transition-all",
                          selectedDuration === value
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start button */}
                <Button
                  onClick={handleStart}
                  disabled={!selectedTask}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Play className="w-4 h-4" />
                  Iniciar Sessão
                </Button>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
