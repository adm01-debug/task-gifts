import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, Clock, Gift, Sparkles, Coins, 
  Check, Lock, Crown, Zap, Award, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EventReward {
  id: string;
  name: string;
  description: string;
  type: "badge" | "coins" | "powerup" | "exclusive";
  pointsRequired: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  isClaimed: boolean;
  quantity?: number;
}

interface EventChallenge {
  id: string;
  title: string;
  description: string;
  points: number;
  progress: number;
  target: number;
  isCompleted: boolean;
}

interface SeasonalEvent {
  id: string;
  name: string;
  theme: string;
  description: string;
  startDate: Date;
  endDate: Date;
  currentPoints: number;
  challenges: EventChallenge[];
  rewards: EventReward[];
  backgroundGradient: string;
  accentColor: string;
}

const mockEvent: SeasonalEvent = {
  id: "summer2024",
  name: "Festival de Verão 🌴",
  theme: "summer",
  description: "Complete desafios especiais e ganhe recompensas exclusivas!",
  startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
  currentPoints: 850,
  backgroundGradient: "from-orange-500/20 via-yellow-500/20 to-red-500/20",
  accentColor: "text-orange-500",
  challenges: [
    { id: "c1", title: "Sol Nascente", description: "Faça login 5 dias seguidos", points: 200, progress: 4, target: 5, isCompleted: false },
    { id: "c2", title: "Onda de Energia", description: "Complete 10 missões", points: 300, progress: 10, target: 10, isCompleted: true },
    { id: "c3", title: "Tempestade de Kudos", description: "Envie 15 kudos", points: 250, progress: 8, target: 15, isCompleted: false },
    { id: "c4", title: "Maré Alta", description: "Alcance nível 20", points: 500, progress: 18, target: 20, isCompleted: false }
  ],
  rewards: [
    { id: "r1", name: "Badge de Verão", description: "Badge exclusivo da temporada", type: "badge", pointsRequired: 200, rarity: "common", isClaimed: true },
    { id: "r2", name: "500 Moedas", description: "Moedas extras", type: "coins", pointsRequired: 400, rarity: "rare", isClaimed: true, quantity: 500 },
    { id: "r3", name: "Power-Up Solar", description: "2x XP por 1 hora", type: "powerup", pointsRequired: 600, rarity: "epic", isClaimed: true },
    { id: "r4", name: "Título: Surfista", description: "Título exclusivo", type: "exclusive", pointsRequired: 1000, rarity: "legendary", isClaimed: false },
    { id: "r5", name: "Avatar de Praia", description: "Item de avatar exclusivo", type: "exclusive", pointsRequired: 1500, rarity: "legendary", isClaimed: false }
  ]
};

const rarityConfig = {
  common: { color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/30" },
  rare: { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  epic: { color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/30" },
  legendary: { color: "text-amber-500", bg: "bg-gradient-to-br from-amber-500/20 to-orange-500/20", border: "border-amber-500/50" }
};

const typeIcons = {
  badge: Award,
  coins: Coins,
  powerup: Zap,
  exclusive: Crown
};

export const SeasonalEventWidget = memo(function SeasonalEventWidget({ 
  className 
}: { 
  className?: string;
}) {
  const [event, setEvent] = useState(mockEvent);
  const [activeTab, setActiveTab] = useState("challenges");

  const timeRemaining = () => {
    const diff = event.endDate.getTime() - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  const completedChallenges = event.challenges.filter(c => c.isCompleted).length;
  const nextReward = event.rewards.find(r => !r.isClaimed);

  const handleClaimReward = useCallback((rewardId: string) => {
    setEvent(prev => ({
      ...prev,
      rewards: prev.rewards.map(r => 
        r.id === rewardId ? { ...r, isClaimed: true } : r
      )
    }));
  }, []);

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Event Header */}
      <div className={cn("p-4 bg-gradient-to-r", event.backgroundGradient)}>
        <div className="flex items-start justify-between">
          <div>
            <Badge variant="secondary" className="mb-2">
              <Sparkles className="w-3 h-3 mr-1" />
              Evento Especial
            </Badge>
            <h3 className="text-xl font-bold">{event.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm font-medium">
              <Clock className="w-4 h-4" />
              {timeRemaining()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">restantes</p>
          </div>
        </div>

        {/* Points Progress */}
        <div className="mt-4 p-3 rounded-lg bg-background/50 backdrop-blur">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className={cn("w-5 h-5", event.accentColor)} />
              <span className="font-bold text-lg">{event.currentPoints}</span>
              <span className="text-sm text-muted-foreground">pontos</span>
            </div>
            {nextReward && (
              <div className="text-right text-xs">
                <span className="text-muted-foreground">Próxima recompensa: </span>
                <span className="font-medium">{nextReward.pointsRequired} pts</span>
              </div>
            )}
          </div>
          {nextReward && (
            <Progress 
              value={(event.currentPoints / nextReward.pointsRequired) * 100} 
              className="h-2"
            />
          )}
        </div>
      </div>

      <CardContent className="pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="challenges" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Desafios ({completedChallenges}/{event.challenges.length})
            </TabsTrigger>
            <TabsTrigger value="rewards" className="text-xs">
              <Gift className="w-3 h-3 mr-1" />
              Recompensas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="space-y-2 mt-0">
            {event.challenges.map(challenge => (
              <motion.div
                key={challenge.id}
                className={cn(
                  "p-3 rounded-lg border transition-all",
                  challenge.isCompleted && "bg-green-500/10 border-green-500/30"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      challenge.isCompleted ? "bg-green-500/20" : "bg-muted"
                    )}>
                      {challenge.isCompleted ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Star className={cn("w-4 h-4", event.accentColor)} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{challenge.title}</h4>
                      <p className="text-xs text-muted-foreground">{challenge.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("shrink-0", event.accentColor)}>
                    +{challenge.points}
                  </Badge>
                </div>
                
                {!challenge.isCompleted && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progresso</span>
                      <span>{challenge.progress}/{challenge.target}</span>
                    </div>
                    <Progress 
                      value={(challenge.progress / challenge.target) * 100} 
                      className="h-1.5"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="rewards" className="mt-0">
            <div className="grid grid-cols-2 gap-2">
              {event.rewards.map(reward => {
                const config = rarityConfig[reward.rarity];
                const Icon = typeIcons[reward.type];
                const canClaim = event.currentPoints >= reward.pointsRequired && !reward.isClaimed;
                const isLocked = event.currentPoints < reward.pointsRequired;

                return (
                  <motion.div
                    key={reward.id}
                    className={cn(
                      "p-3 rounded-lg border relative",
                      config.bg,
                      config.border,
                      reward.isClaimed && "opacity-60"
                    )}
                    whileHover={canClaim ? { scale: 1.02 } : {}}
                  >
                    {isLocked && (
                      <div className="absolute inset-0 bg-background/50 rounded-lg flex items-center justify-center">
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    
                    <Badge 
                      variant="outline" 
                      className={cn("text-[10px] capitalize mb-2", config.color, config.border)}
                    >
                      {reward.rarity}
                    </Badge>

                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-2", config.bg)}>
                      <Icon className={cn("w-5 h-5", config.color)} />
                    </div>

                    <h4 className="font-medium text-xs">{reward.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{reward.pointsRequired} pts</p>

                    {reward.isClaimed && (
                      <Badge className="absolute top-2 right-2 bg-green-500 text-white text-[10px]">
                        <Check className="w-3 h-3" />
                      </Badge>
                    )}

                    {canClaim && (
                      <Button
                        size="sm"
                        className="w-full mt-2 h-7 text-xs"
                        onClick={() => handleClaimReward(reward.id)}
                      >
                        <Gift className="w-3 h-3 mr-1" />
                        Resgatar
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
});

export default SeasonalEventWidget;
