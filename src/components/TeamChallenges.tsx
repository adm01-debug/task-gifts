import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Users, Target, Trophy, Clock, Zap, ChevronRight, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamChallenge {
  id: string;
  title: string;
  description: string;
  teamA: { name: string; score: number; color: string };
  teamB: { name: string; score: number; color: string };
  endTime: string;
  xpReward: number;
  participants: number;
}

const challenges: TeamChallenge[] = [
  {
    id: "1",
    title: "Sprint Champion",
    description: "Primeira equipe a completar 50 tarefas",
    teamA: { name: "Alpha", score: 38, color: "primary" },
    teamB: { name: "Beta", score: 42, color: "secondary" },
    endTime: "2h 30m",
    xpReward: 1000,
    participants: 24,
  },
  {
    id: "2",
    title: "Code Review Race",
    description: "Maior número de reviews aprovados",
    teamA: { name: "Frontend", score: 15, color: "success" },
    teamB: { name: "Backend", score: 12, color: "accent" },
    endTime: "5h 15m",
    xpReward: 750,
    participants: 18,
  },
];

export const TeamChallenges = () => {
  const [activeChallenge, setActiveChallenge] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-card rounded-2xl border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center">
            <Users className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <h3 className="font-bold">Desafios de Equipe</h3>
            <p className="text-xs text-muted-foreground">{challenges.length} ativos agora</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
        >
          <Flame className="w-5 h-5 text-streak streak-fire" />
        </motion.div>
      </div>

      {/* Challenges */}
      <div className="divide-y divide-border">
        {challenges.map((challenge, i) => {
          const total = challenge.teamA.score + challenge.teamB.score;
          const teamAPercent = total > 0 ? (challenge.teamA.score / 50) * 100 : 50;
          const teamBPercent = total > 0 ? (challenge.teamB.score / 50) * 100 : 50;

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              onMouseEnter={() => setActiveChallenge(challenge.id)}
              onMouseLeave={() => setActiveChallenge(null)}
              className="p-4 hover:bg-muted/20 transition-colors cursor-pointer"
            >
              {/* Title Row */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">{challenge.title}</h4>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-destructive/20 text-destructive">
                      AO VIVO
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{challenge.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>

              {/* VS Battle */}
              <div className="relative mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                      challenge.teamA.color === "primary" && "bg-primary/20 text-primary",
                      challenge.teamA.color === "success" && "bg-success/20 text-success"
                    )}>
                      {challenge.teamA.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{challenge.teamA.name}</p>
                      <p className="text-xs text-muted-foreground">{challenge.teamA.score}/50</p>
                    </div>
                  </div>

                  <motion.div
                    animate={activeChallenge === challenge.id ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5 }}
                    className="text-lg font-bold text-muted-foreground"
                  >
                    VS
                  </motion.div>

                  <div className="flex items-center gap-2 text-right">
                    <div>
                      <p className="font-semibold text-sm">{challenge.teamB.name}</p>
                      <p className="text-xs text-muted-foreground">{challenge.teamB.score}/50</p>
                    </div>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                      challenge.teamB.color === "secondary" && "bg-secondary/20 text-secondary",
                      challenge.teamB.color === "accent" && "bg-accent/20 text-accent"
                    )}>
                      {challenge.teamB.name.charAt(0)}
                    </div>
                  </div>
                </div>

                {/* Progress Battle Bar */}
                <div className="h-3 rounded-full bg-muted overflow-hidden flex">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${teamAPercent}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.2 }}
                    className={cn(
                      "h-full",
                      challenge.teamA.color === "primary" && "bg-gradient-to-r from-primary to-primary/70",
                      challenge.teamA.color === "success" && "bg-gradient-to-r from-success to-success/70"
                    )}
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${teamBPercent}%` }}
                    transition={{ duration: 0.8, delay: 0.6 + i * 0.2 }}
                    className={cn(
                      "h-full",
                      challenge.teamB.color === "secondary" && "bg-gradient-to-l from-secondary to-secondary/70",
                      challenge.teamB.color === "accent" && "bg-gradient-to-l from-accent to-accent/70"
                    )}
                  />
                </div>
              </div>

              {/* Footer info */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{challenge.endTime}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{challenge.participants} participantes</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-xp" />
                  <span className="font-semibold text-xp">+{challenge.xpReward} XP</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Join CTA */}
      <div className="p-4 border-t border-border">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-secondary to-accent text-secondary-foreground font-semibold text-sm transition-all duration-200 hover:opacity-90"
        >
          Criar novo desafio
        </motion.button>
      </div>
    </motion.div>
  );
};
