import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Coins, Star, Zap, Crown, Lock, CheckCircle2, Sparkles } from "lucide-react";

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

export function DailyRewards() {
  const [currentDay] = useState(4);
  const [showClaim, setShowClaim] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const handleClaim = () => {
    setShowClaim(true);
    setTimeout(() => {
      setClaimed(true);
      setShowClaim(false);
    }, 2000);
  };

  const todayReward = weeklyRewards[currentDay - 1];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="h-5 w-5 text-primary" />
          Recompensas Diárias
          <Badge variant="secondary" className="ml-auto">
            Dia {currentDay}/7
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weekly Progress */}
        <div className="flex justify-between gap-1">
          {weeklyRewards.map((reward, index) => (
            <motion.div
              key={reward.day}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`
                relative flex-1 flex flex-col items-center p-2 rounded-lg border-2 transition-all
                ${reward.claimed 
                  ? "bg-primary/10 border-primary" 
                  : reward.day === currentDay 
                    ? "bg-accent border-primary animate-pulse" 
                    : "bg-muted/50 border-border"
                }
                ${reward.isMilestone ? "ring-2 ring-amber-500/50" : ""}
              `}
            >
              {reward.isMilestone && (
                <Crown className="absolute -top-2 h-4 w-4 text-amber-500" />
              )}
              
              <span className="text-xs font-medium text-muted-foreground">
                D{reward.day}
              </span>
              
              {reward.claimed ? (
                <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
              ) : reward.day === currentDay ? (
                <Gift className="h-5 w-5 text-primary mt-1" />
              ) : (
                <Lock className="h-5 w-5 text-muted-foreground/50 mt-1" />
              )}
              
              <div className="flex items-center gap-0.5 mt-1">
                <Coins className="h-3 w-3 text-amber-500" />
                <span className="text-xs font-bold">{reward.coins}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Today's Reward Card */}
        <motion.div
          className="relative p-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30"
          whileHover={{ scale: 1.02 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-xl" />
          
          <div className="relative flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Recompensa de Hoje
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-amber-500" />
                  <span className="font-bold">{todayReward.coins}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-primary" />
                  <span className="font-bold">{todayReward.xp} XP</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleClaim}
              disabled={claimed}
              className="relative overflow-hidden"
            >
              {claimed ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Coletado!
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Coletar
                </>
              )}
            </Button>
          </div>

          {/* Streak Bonus */}
          <div className="relative mt-3 pt-3 border-t border-primary/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Bônus de Sequência (3 dias)</span>
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                <Sparkles className="h-3 w-3 mr-1" />
                +50% XP
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Claim Animation Overlay */}
        <AnimatePresence>
          {showClaim && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="text-center space-y-4"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                  <Gift className="h-24 w-24 text-primary mx-auto" />
                </motion.div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Recompensa Coletada!</h3>
                  <div className="flex items-center justify-center gap-4 text-lg">
                    <span className="flex items-center gap-1">
                      <Coins className="h-5 w-5 text-amber-500" />
                      +{todayReward.coins}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-5 w-5 text-primary" />
                      +{todayReward.xp} XP
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
