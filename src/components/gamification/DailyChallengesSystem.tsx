import { memo, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CalendarCheck, Gift, Flame, Star, Coins, Zap, 
  Check, Lock, Sparkles, Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  xpReward: number;
  coinReward: number;
  isCompleted: boolean;
  isClaimed: boolean;
  icon: React.ElementType;
}

interface WeeklyMilestone {
  day: number;
  xpReward: number;
  coinReward: number;
  bonusItem?: string;
  isClaimed: boolean;
  isUnlocked: boolean;
}

const mockChallenges: DailyChallenge[] = [
  {
    id: "login",
    title: "Pontualidade",
    description: "Faça login antes das 9h",
    progress: 1,
    target: 1,
    xpReward: 25,
    coinReward: 10,
    isCompleted: true,
    isClaimed: true,
    icon: CalendarCheck
  },
  {
    id: "tasks",
    title: "Produtivo",
    description: "Complete 3 tarefas",
    progress: 2,
    target: 3,
    xpReward: 50,
    coinReward: 25,
    isCompleted: false,
    isClaimed: false,
    icon: Check
  },
  {
    id: "kudos",
    title: "Reconhecedor",
    description: "Envie 2 kudos para colegas",
    progress: 1,
    target: 2,
    xpReward: 30,
    coinReward: 15,
    isCompleted: false,
    isClaimed: false,
    icon: Star
  },
  {
    id: "learning",
    title: "Aprendiz",
    description: "Complete 1 lição na trilha",
    progress: 1,
    target: 1,
    xpReward: 40,
    coinReward: 20,
    isCompleted: true,
    isClaimed: false,
    icon: Sparkles
  }
];

const mockMilestones: WeeklyMilestone[] = [
  { day: 1, xpReward: 50, coinReward: 25, isClaimed: true, isUnlocked: true },
  { day: 2, xpReward: 75, coinReward: 35, isClaimed: true, isUnlocked: true },
  { day: 3, xpReward: 100, coinReward: 50, bonusItem: "Power-Up XP", isClaimed: true, isUnlocked: true },
  { day: 4, xpReward: 125, coinReward: 60, isClaimed: false, isUnlocked: true },
  { day: 5, xpReward: 150, coinReward: 75, bonusItem: "Loot Box", isClaimed: false, isUnlocked: false },
  { day: 6, xpReward: 200, coinReward: 100, isClaimed: false, isUnlocked: false },
  { day: 7, xpReward: 300, coinReward: 150, bonusItem: "Badge Exclusivo", isClaimed: false, isUnlocked: false }
];

const ChallengeCard = memo(function ChallengeCard({ 
  challenge, 
  onClaim 
}: { 
  challenge: DailyChallenge;
  onClaim: (id: string) => void;
}) {
  const Icon = challenge.icon;
  const progressPercent = (challenge.progress / challenge.target) * 100;

  return (
    <motion.div
      layout
      className={cn(
        "p-3 rounded-lg border transition-all",
        challenge.isClaimed && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          challenge.isCompleted ? "bg-green-500/20" : "bg-muted"
        )}>
          <Icon className={cn(
            "w-5 h-5",
            challenge.isCompleted ? "text-green-500" : "text-muted-foreground"
          )} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-medium text-sm truncate">{challenge.title}</h4>
            {challenge.isCompleted && !challenge.isClaimed && (
              <Badge className="bg-green-500 text-white shrink-0">
                <Gift className="w-3 h-3 mr-1" />
                Resgatar
              </Badge>
            )}
            {challenge.isClaimed && (
              <Badge variant="secondary" className="shrink-0">
                <Check className="w-3 h-3 mr-1" />
                Resgatado
              </Badge>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mt-0.5">
            {challenge.description}
          </p>

          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">
                {challenge.progress}/{challenge.target}
              </span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-0.5 text-yellow-500">
                  <Star className="w-3 h-3" />
                  {challenge.xpReward}
                </span>
                <span className="flex items-center gap-0.5 text-amber-500">
                  <Coins className="w-3 h-3" />
                  {challenge.coinReward}
                </span>
              </div>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>

          {challenge.isCompleted && !challenge.isClaimed && (
            <Button
              size="sm"
              className="w-full mt-2 h-7 text-xs"
              onClick={() => onClaim(challenge.id)}
            >
              <Gift className="w-3 h-3 mr-1" />
              Resgatar Recompensa
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export const DailyChallengesSystem = memo(function DailyChallengesSystem({ 
  className 
}: { 
  className?: string;
}) {
  const [challenges, setChallenges] = useState(mockChallenges);
  const [milestones, setMilestones] = useState(mockMilestones);
  const [currentStreak] = useState(4);

  const stats = useMemo(() => {
    const completed = challenges.filter(c => c.isCompleted).length;
    const claimed = challenges.filter(c => c.isClaimed).length;
    const totalXp = challenges.reduce((sum, c) => sum + c.xpReward, 0);
    const earnedXp = challenges.filter(c => c.isClaimed).reduce((sum, c) => sum + c.xpReward, 0);
    return { completed, claimed, total: challenges.length, totalXp, earnedXp };
  }, [challenges]);

  const handleClaimChallenge = (id: string) => {
    setChallenges(prev => prev.map(c => 
      c.id === id ? { ...c, isClaimed: true } : c
    ));
  };

  const handleClaimMilestone = (day: number) => {
    setMilestones(prev => prev.map(m => 
      m.day === day ? { ...m, isClaimed: true } : m
    ));
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Desafios Diários</CardTitle>
              <p className="text-xs text-muted-foreground">
                {stats.completed}/{stats.total} completos • Streak: {currentStreak} dias
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-bold text-orange-500">{currentStreak}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Weekly Milestones */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Marcos Semanais
          </h4>
          <div className="flex gap-1">
            {milestones.map(milestone => (
              <motion.button
                key={milestone.day}
                onClick={() => milestone.isUnlocked && !milestone.isClaimed && handleClaimMilestone(milestone.day)}
                disabled={!milestone.isUnlocked || milestone.isClaimed}
                className={cn(
                  "flex-1 py-2 px-1 rounded-lg border text-center transition-all",
                  milestone.isClaimed && "bg-green-500/20 border-green-500/50",
                  milestone.isUnlocked && !milestone.isClaimed && "bg-primary/10 border-primary/50 hover:bg-primary/20 cursor-pointer",
                  !milestone.isUnlocked && "bg-muted border-muted-foreground/20 opacity-50"
                )}
                whileHover={milestone.isUnlocked && !milestone.isClaimed ? { scale: 1.05 } : {}}
                whileTap={milestone.isUnlocked && !milestone.isClaimed ? { scale: 0.95 } : {}}
              >
                <div className="text-[10px] text-muted-foreground mb-1">Dia</div>
                <div className={cn(
                  "font-bold text-sm",
                  milestone.isClaimed && "text-green-500",
                  milestone.isUnlocked && !milestone.isClaimed && "text-primary"
                )}>
                  {milestone.isClaimed ? (
                    <Check className="w-4 h-4 mx-auto" />
                  ) : milestone.isUnlocked ? (
                    milestone.day
                  ) : (
                    <Lock className="w-3 h-3 mx-auto" />
                  )}
                </div>
                {milestone.bonusItem && (
                  <div className="mt-1">
                    <Gift className="w-3 h-3 mx-auto text-purple-500" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Challenges List */}
        <div className="space-y-2">
          <AnimatePresence>
            {challenges.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onClaim={handleClaimChallenge}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Progresso do Dia</p>
              <p className="text-xs text-muted-foreground">
                {stats.earnedXp}/{stats.totalXp} XP ganhos
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {Math.round((stats.claimed / stats.total) * 100)}%
              </p>
            </div>
          </div>
          <Progress 
            value={(stats.claimed / stats.total) * 100} 
            className="h-2 mt-2"
          />
        </div>
      </CardContent>
    </Card>
  );
});

export default DailyChallengesSystem;
