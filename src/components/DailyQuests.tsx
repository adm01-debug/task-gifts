import { motion } from "framer-motion";
import { Target, Clock, Zap, CheckCircle2, Circle, Flame, Gift, Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  coins?: number;
  progress: number;
  total: number;
  type: "daily" | "weekly" | "special";
  timeLeft?: string;
  completed: boolean;
}

const quests: Quest[] = [
  {
    id: "1",
    title: "Complete 3 tarefas",
    description: "Finalize qualquer tipo de tarefa",
    xp: 150,
    coins: 50,
    progress: 2,
    total: 3,
    type: "daily",
    completed: false,
  },
  {
    id: "2",
    title: "Primeiro do dia",
    description: "Complete uma tarefa antes das 10h",
    xp: 100,
    progress: 1,
    total: 1,
    type: "daily",
    completed: true,
  },
  {
    id: "3",
    title: "Colaborador",
    description: "Ajude 2 colegas com suas tarefas",
    xp: 200,
    coins: 75,
    progress: 0,
    total: 2,
    type: "daily",
    timeLeft: "8h",
    completed: false,
  },
  {
    id: "4",
    title: "Evento Especial: Hackathon",
    description: "Participe do hackathon de inovação",
    xp: 500,
    coins: 200,
    progress: 0,
    total: 1,
    type: "special",
    timeLeft: "2d 5h",
    completed: false,
  },
];

export const DailyQuests = () => {
  const [hoveredQuest, setHoveredQuest] = useState<string | null>(null);

  const completedCount = quests.filter(q => q.completed).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-card rounded-2xl border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-bold">Quests Diárias</h3>
              <p className="text-xs text-muted-foreground">{completedCount}/{quests.length} completas</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Reset em 16h</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / quests.length) * 100}%` }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
          />
        </div>
      </div>

      {/* Quest List */}
      <div className="divide-y divide-border">
        {quests.map((quest, i) => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            onMouseEnter={() => setHoveredQuest(quest.id)}
            onMouseLeave={() => setHoveredQuest(null)}
            className={cn(
              "p-4 transition-all duration-200",
              quest.completed ? "bg-success/5" : "hover:bg-muted/30",
              quest.type === "special" && "bg-gradient-to-r from-accent/5 to-transparent"
            )}
          >
            <div className="flex items-start gap-3">
              {/* Status icon */}
              <motion.div
                animate={quest.completed ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
                className="mt-0.5"
              >
                {quest.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <Circle className={cn(
                    "w-5 h-5",
                    quest.type === "special" ? "text-accent" : "text-muted-foreground"
                  )} />
                )}
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={cn(
                    "font-semibold text-sm",
                    quest.completed && "line-through text-muted-foreground"
                  )}>
                    {quest.title}
                  </h4>
                  {quest.type === "special" && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent/20 text-accent">
                      ESPECIAL
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{quest.description}</p>

                {/* Progress */}
                {!quest.completed && (
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">{quest.progress}/{quest.total}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(quest.progress / quest.total) * 100}%` }}
                        transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                        className={cn(
                          "h-full rounded-full",
                          quest.type === "special" 
                            ? "bg-gradient-to-r from-accent to-primary" 
                            : "bg-gradient-to-r from-secondary to-primary"
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Rewards */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-xp" />
                    <span className="text-xs font-semibold text-xp">+{quest.xp} XP</span>
                  </div>
                  {quest.coins && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-coins coin-shine" />
                      <span className="text-xs font-semibold text-coins">+{quest.coins}</span>
                    </div>
                  )}
                  {quest.timeLeft && !quest.completed && (
                    <div className="flex items-center gap-1 ml-auto">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{quest.timeLeft}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Claim button for completed */}
              {quest.completed && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 rounded-lg bg-success text-success-foreground text-xs font-bold"
                >
                  Resgatar
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Streak Bonus */}
      <div className="p-4 border-t border-border bg-gradient-to-r from-streak/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-streak streak-fire" />
            <div>
              <p className="font-semibold text-sm">Streak Bonus Ativo!</p>
              <p className="text-xs text-muted-foreground">+25% XP em todas as quests</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-streak/20 text-streak font-bold text-sm">
            12 dias 🔥
          </div>
        </div>
      </div>
    </motion.div>
  );
};
