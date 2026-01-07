import { useState, useMemo, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Gift, 
  Coins, 
  Star, 
  Zap, 
  Crown, 
  Lock, 
  CheckCircle2, 
  Sparkles,
  Flame,
  Calendar,
  TrendingUp,
  Trophy,
  PartyPopper,
  Clock
} from "lucide-react";

interface DailyReward {
  day: number;
  coins: number;
  xp: number;
  bonus?: string;
  isMilestone?: boolean;
  claimed?: boolean;
}

const weeklyRewards: DailyReward[] = [
  { day: 1, coins: 10, xp: 25, claimed: true },
  { day: 2, coins: 15, xp: 30, claimed: true },
  { day: 3, coins: 20, xp: 40, claimed: true },
  { day: 4, coins: 25, xp: 50, claimed: false },
  { day: 5, coins: 30, xp: 60, claimed: false },
  { day: 6, coins: 40, xp: 75, claimed: false },
  { day: 7, coins: 100, xp: 200, bonus: "Badge Especial", isMilestone: true, claimed: false },
];

const streakBonuses = [
  { days: 3, bonus: "+25% XP", icon: TrendingUp, color: "text-emerald-500" },
  { days: 5, bonus: "+50% XP", icon: Flame, color: "text-orange-500" },
  { days: 7, bonus: "+100% XP + Badge", icon: Crown, color: "text-amber-500" },
];

interface RewardDayCardProps {
  reward: DailyReward;
  currentDay: number;
  index: number;
}

const RewardDayCard = memo(function RewardDayCard({ reward, currentDay, index }: RewardDayCardProps) {
  const isToday = reward.day === currentDay;
  const isPast = reward.claimed;
  const isFuture = reward.day > currentDay;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
      whileHover={isToday ? { scale: 1.05, y: -2 } : undefined}
      className={`
        relative flex-1 flex flex-col items-center p-2 rounded-xl border-2 transition-all cursor-pointer
        ${isPast 
          ? "bg-primary/10 border-primary/50" 
          : isToday 
            ? "bg-gradient-to-br from-primary/20 to-accent/20 border-primary shadow-lg shadow-primary/20" 
            : "bg-muted/30 border-border/50"
        }
        ${reward.isMilestone ? "ring-2 ring-amber-500/50 ring-offset-1 ring-offset-background" : ""}
      `}
    >
      {/* Milestone Crown */}
      {reward.isMilestone && (
        <motion.div
          animate={{ y: [0, -2, 0], rotate: [-5, 5, -5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-3"
        >
          <Crown className="h-5 w-5 text-amber-500 drop-shadow-lg" />
        </motion.div>
      )}

      {/* Today Indicator */}
      {isToday && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
        />
      )}
      
      <span className={`text-xs font-bold ${isToday ? "text-primary" : "text-muted-foreground"}`}>
        D{reward.day}
      </span>
      
      <motion.div 
        className="my-1"
        animate={isToday ? { rotate: [0, 10, -10, 0] } : undefined}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
      >
        {isPast ? (
          <CheckCircle2 className="h-5 w-5 text-primary" />
        ) : isToday ? (
          <Gift className="h-5 w-5 text-primary" />
        ) : (
          <Lock className="h-5 w-5 text-muted-foreground/40" />
        )}
      </motion.div>
      
      <div className="flex items-center gap-0.5">
        <Coins className="h-3 w-3 text-amber-500" />
        <span className={`text-xs font-bold ${isPast ? "text-muted-foreground" : ""}`}>
          {reward.coins}
        </span>
      </div>

      {/* Sparkle effect for today */}
      {isToday && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="absolute top-0 right-0 h-3 w-3 text-primary/60" />
          <Sparkles className="absolute bottom-1 left-0 h-2 w-2 text-amber-500/60" />
        </motion.div>
      )}
    </motion.div>
  );
});

interface ClaimOverlayProps {
  reward: DailyReward;
  onClose: () => void;
}

const ClaimOverlay = memo(function ClaimOverlay({ reward, onClose }: ClaimOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.3, opacity: 0, rotateY: -180 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        exit={{ scale: 0.3, opacity: 0, rotateY: 180 }}
        transition={{ type: "spring", damping: 15 }}
        className="text-center space-y-6 p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Gift Box */}
        <div className="relative">
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, -10, 10, 0],
              scale: [1, 1.1, 1, 1.1, 1]
            }}
            transition={{ duration: 0.8, repeat: 2 }}
          >
            <div className="relative inline-block">
              <Gift className="h-32 w-32 text-primary mx-auto drop-shadow-2xl" />
              
              {/* Particles */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0.5],
                    x: Math.cos(i * 30 * Math.PI / 180) * 80,
                    y: Math.sin(i * 30 * Math.PI / 180) * 80 - 20
                  }}
                  transition={{ duration: 1.5, delay: 0.5 + i * 0.05 }}
                  className="absolute top-1/2 left-1/2"
                >
                  {i % 3 === 0 ? (
                    <Star className="h-4 w-4 text-amber-500" />
                  ) : i % 3 === 1 ? (
                    <Coins className="h-4 w-4 text-amber-400" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-primary" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Reward Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center gap-2">
            <PartyPopper className="h-6 w-6 text-amber-500" />
            <h3 className="text-3xl font-bold bg-gradient-to-r from-primary via-amber-500 to-primary bg-clip-text text-transparent">
              Recompensa Coletada!
            </h3>
            <PartyPopper className="h-6 w-6 text-amber-500 scale-x-[-1]" />
          </div>

          <div className="flex items-center justify-center gap-6 text-xl">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: "spring" }}
              className="flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-full"
            >
              <Coins className="h-6 w-6 text-amber-500" />
              <span className="font-bold text-amber-500">+{reward.coins}</span>
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.1, type: "spring" }}
              className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full"
            >
              <Star className="h-6 w-6 text-primary" />
              <span className="font-bold text-primary">+{reward.xp} XP</span>
            </motion.div>
          </div>

          {reward.bonus && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2, type: "spring" }}
            >
              <Badge className="text-base bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1">
                <Trophy className="h-4 w-4 mr-2" />
                {reward.bonus}
              </Badge>
            </motion.div>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-sm text-muted-foreground"
          >
            Clique para continuar
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
});

export const DailyRewards = memo(function DailyRewards() {
  const [currentDay] = useState(4);
  const [showClaim, setShowClaim] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [rewards, setRewards] = useState(weeklyRewards);

  const todayReward = useMemo(() => rewards[currentDay - 1], [rewards, currentDay]);
  
  const streakDays = useMemo(() => 
    rewards.filter(r => r.claimed).length, 
    [rewards]
  );

  const currentBonus = useMemo(() => {
    return streakBonuses.reduce((acc, bonus) => {
      if (streakDays >= bonus.days) return bonus;
      return acc;
    }, streakBonuses[0]);
  }, [streakDays]);

  const nextBonus = useMemo(() => {
    return streakBonuses.find(b => b.days > streakDays);
  }, [streakDays]);

  const weekProgress = useMemo(() => 
    (streakDays / 7) * 100, 
    [streakDays]
  );

  const totalEarned = useMemo(() => ({
    coins: rewards.filter(r => r.claimed).reduce((sum, r) => sum + r.coins, 0),
    xp: rewards.filter(r => r.claimed).reduce((sum, r) => sum + r.xp, 0)
  }), [rewards]);

  const handleClaim = useCallback(() => {
    if (claimed) return;
    setShowClaim(true);
  }, [claimed]);

  const handleClaimComplete = useCallback(() => {
    setClaimed(true);
    setShowClaim(false);
    setRewards(prev => prev.map((r, i) => 
      i === currentDay - 1 ? { ...r, claimed: true } : r
    ));
  }, [currentDay]);

  // Time until reset
  const hoursUntilReset = useMemo(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight.getTime() - now.getTime()) / (1000 * 60 * 60));
  }, []);

  return (
    <Card className="overflow-hidden border-primary/20">
      {/* Premium Header */}
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Gift className="h-5 w-5 text-primary" />
            </motion.div>
            Recompensas Diárias
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Renova em {hoursUntilReset}h
            </Badge>
            <Badge className="bg-gradient-to-r from-primary to-primary/80">
              <Calendar className="h-3 w-3 mr-1" />
              Dia {currentDay}/7
            </Badge>
          </div>
        </div>

        {/* Week Progress */}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progresso Semanal</span>
            <span>{streakDays}/7 dias</span>
          </div>
          <Progress value={weekProgress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Weekly Progress Cards */}
        <div className="flex justify-between gap-1">
          {rewards.map((reward, index) => (
            <RewardDayCard 
              key={reward.day} 
              reward={reward} 
              currentDay={currentDay}
              index={index}
            />
          ))}
        </div>

        {/* Today's Reward Card */}
        <motion.div
          className="relative p-4 rounded-xl bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 border border-primary/20 overflow-hidden"
          whileHover={{ scale: 1.01 }}
        >
          {/* Background Animation */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          
          <div className="relative flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Recompensa de Hoje
                </p>
                {streakDays >= 3 && (
                  <Badge variant="secondary" className="text-xs">
                    <Flame className="h-3 w-3 mr-1 text-orange-500" />
                    {streakDays} dias
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <motion.div 
                  className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <Coins className="h-5 w-5 text-amber-500" />
                  <span className="font-bold text-lg">{todayReward.coins}</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <Star className="h-5 w-5 text-primary" />
                  <span className="font-bold text-lg">{todayReward.xp} XP</span>
                </motion.div>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleClaim}
                disabled={claimed}
                size="lg"
                className={`
                  relative overflow-hidden
                  ${!claimed ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" : ""}
                `}
              >
                {claimed ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Coletado!
                  </>
                ) : (
                  <>
                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                    <Zap className="h-5 w-5 mr-2" />
                    Coletar
                  </>
                )}
              </Button>
            </motion.div>
          </div>

          {/* Streak Bonus Section */}
          <div className="relative mt-4 pt-4 border-t border-primary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${
                  streakDays >= 7 ? "from-amber-500/20 to-orange-500/20" :
                  streakDays >= 5 ? "from-orange-500/20 to-red-500/20" :
                  "from-emerald-500/20 to-green-500/20"
                }`}>
                  <Flame className={`h-5 w-5 ${
                    streakDays >= 7 ? "text-amber-500" :
                    streakDays >= 5 ? "text-orange-500" :
                    "text-emerald-500"
                  }`} />
                </div>
                <div>
                  <p className="text-sm font-medium">Bônus de Sequência</p>
                  <p className="text-xs text-muted-foreground">
                    {streakDays >= 3 
                      ? `${streakDays} dias consecutivos!`
                      : `Faltam ${3 - streakDays} dias para bônus`
                    }
                  </p>
                </div>
              </div>
              
              <Badge className={`
                ${streakDays >= 7 
                  ? "bg-gradient-to-r from-amber-500 to-orange-500" 
                  : streakDays >= 5
                    ? "bg-gradient-to-r from-orange-500 to-red-500"
                    : streakDays >= 3
                      ? "bg-gradient-to-r from-emerald-500 to-green-500"
                      : "bg-muted"
                }
              `}>
                {streakDays >= 3 ? (
                  <>
                    <Sparkles className="h-3 w-3 mr-1" />
                    {currentBonus.bonus}
                  </>
                ) : (
                  <span className="text-muted-foreground">Sem bônus</span>
                )}
              </Badge>
            </div>

            {/* Next Bonus Progress */}
            {nextBonus && (
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Próximo bônus: {nextBonus.bonus}</span>
                  <span>{nextBonus.days - streakDays} dias restantes</span>
                </div>
                <Progress 
                  value={(streakDays / nextBonus.days) * 100} 
                  className="h-1.5"
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Weekly Stats */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20"
          >
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Total Ganho</span>
            </div>
            <p className="text-xl font-bold text-amber-500 mt-1">{totalEarned.coins}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20"
          >
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">XP Ganho</span>
            </div>
            <p className="text-xl font-bold text-primary mt-1">{totalEarned.xp}</p>
          </motion.div>
        </div>

        {/* Streak Milestones */}
        <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-2">Marcos de Sequência</p>
          <div className="flex justify-between">
            {streakBonuses.map((bonus, index) => (
              <motion.div
                key={bonus.days}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                  streakDays >= bonus.days 
                    ? "bg-primary/10 border border-primary/30" 
                    : "opacity-50"
                }`}
              >
                <bonus.icon className={`h-4 w-4 ${bonus.color}`} />
                <span className="text-xs font-bold">{bonus.days} dias</span>
                <span className="text-[10px] text-muted-foreground">{bonus.bonus}</span>
                {streakDays >= bonus.days && (
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Claim Animation Overlay */}
      <AnimatePresence>
        {showClaim && (
          <ClaimOverlay reward={todayReward} onClose={handleClaimComplete} />
        )}
      </AnimatePresence>
    </Card>
  );
});

export default DailyRewards;
