import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, Clock, CheckCircle2, ChevronRight, 
  Sparkles, Coffee, BookOpen, Target, 
  MessageSquare, Trophy, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import confetti from "canvas-confetti";

export interface MicroQuest {
  id: string;
  title: string;
  description: string;
  duration: "2min" | "5min";
  xpReward: number;
  coinReward: number;
  category: "learning" | "social" | "wellness" | "productivity";
  icon: React.ReactNode;
  action?: () => void;
}

const categoryColors = {
  learning: "from-blue-500 to-cyan-500",
  social: "from-pink-500 to-rose-500",
  wellness: "from-green-500 to-emerald-500",
  productivity: "from-purple-500 to-violet-500",
};

const categoryBg = {
  learning: "bg-blue-500/10",
  social: "bg-pink-500/10",
  wellness: "bg-green-500/10",
  productivity: "bg-purple-500/10",
};

interface MicroQuestCardProps {
  quest: MicroQuest;
  onComplete: (questId: string) => void;
  onStart?: (questId: string) => void;
}

export function MicroQuestCard({ quest, onComplete, onStart }: MicroQuestCardProps) {
  const [status, setStatus] = useState<"idle" | "active" | "completed">("idle");
  const [progress, setProgress] = useState(0);

  const handleStart = () => {
    setStatus("active");
    onStart?.(quest.id);
    
    // Simulate progress
    const duration = quest.duration === "2min" ? 2000 : 5000; // Accelerated for demo
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, duration / 20);
  };

  const handleComplete = () => {
    setStatus("completed");
    onComplete(quest.id);
    
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`
        relative overflow-hidden rounded-xl border border-border
        ${status === "completed" ? "bg-green-500/5" : "bg-card"}
        transition-colors
      `}
    >
      {/* Gradient accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${categoryColors[quest.category]}`} />

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`p-2 rounded-lg ${categoryBg[quest.category]}`}>
            {quest.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium truncate">{quest.title}</h4>
              {status === "completed" && (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              )}
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {quest.description}
            </p>

            {/* Meta info */}
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                {quest.duration}
              </span>
              <span className="flex items-center gap-1 text-amber-500">
                <Zap className="w-3 h-3" />
                +{quest.xpReward} XP
              </span>
              <span className="flex items-center gap-1 text-yellow-500">
                <Star className="w-3 h-3" />
                +{quest.coinReward}
              </span>
            </div>
          </div>
        </div>

        {/* Action area */}
        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-3"
            >
              <Button
                size="sm"
                className={`w-full bg-gradient-to-r ${categoryColors[quest.category]} text-white`}
                onClick={handleStart}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Começar
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </motion.div>
          )}

          {status === "active" && (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-3 space-y-2"
            >
              <Progress value={progress} className="h-2" />
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={handleComplete}
                disabled={progress < 100}
              >
                {progress < 100 ? (
                  <>Em progresso... {progress}%</>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Concluir
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {status === "completed" && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 text-center py-2"
            >
              <div className="inline-flex items-center gap-2 text-green-600 dark:text-green-400">
                <Trophy className="w-4 h-4" />
                <span className="font-medium">Concluído!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Sample micro-quests
export const sampleMicroQuests: MicroQuest[] = [
  {
    id: "1",
    title: "Café com Propósito",
    description: "Reflita sobre sua maior prioridade do dia",
    duration: "2min",
    xpReward: 25,
    coinReward: 5,
    category: "wellness",
    icon: <Coffee className="w-5 h-5 text-green-500" />,
  },
  {
    id: "2",
    title: "Micro-Leitura",
    description: "Leia um artigo curto sobre sua área",
    duration: "5min",
    xpReward: 50,
    coinReward: 10,
    category: "learning",
    icon: <BookOpen className="w-5 h-5 text-blue-500" />,
  },
  {
    id: "3",
    title: "Agradeça um Colega",
    description: "Envie um elogio rápido para alguém",
    duration: "2min",
    xpReward: 30,
    coinReward: 8,
    category: "social",
    icon: <MessageSquare className="w-5 h-5 text-pink-500" />,
  },
  {
    id: "4",
    title: "Meta Check",
    description: "Revise o progresso de uma meta",
    duration: "2min",
    xpReward: 20,
    coinReward: 5,
    category: "productivity",
    icon: <Target className="w-5 h-5 text-purple-500" />,
  },
];

// Container for micro-quests list
export function MicroQuestsList({
  quests = sampleMicroQuests,
  onComplete,
}: {
  quests?: MicroQuest[];
  onComplete?: (questId: string) => void;
}) {
  const handleComplete = (questId: string) => {
    onComplete?.(questId);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Micro-Quests
        </h3>
        <span className="text-xs text-muted-foreground">2-5 min cada</span>
      </div>
      
      <div className="space-y-2">
        {quests.map((quest) => (
          <MicroQuestCard
            key={quest.id}
            quest={quest}
            onComplete={handleComplete}
          />
        ))}
      </div>
    </div>
  );
}
