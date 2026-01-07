import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Box, 
  Gift, 
  Star, 
  Zap,
  Sparkles,
  Lock,
  Unlock,
  Clock,
  Crown,
  Gem
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Chest {
  id: string;
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  status: "available" | "locked" | "cooldown";
  unlocksIn?: string;
  keysRequired: number;
  keysOwned: number;
  possibleRewards: string[];
}

interface Reward {
  type: "xp" | "coins" | "item" | "badge";
  name: string;
  amount?: number;
  rarity?: string;
}

const mockChests: Chest[] = [
  {
    id: "1",
    name: "Baú Diário",
    rarity: "common",
    status: "available",
    keysRequired: 1,
    keysOwned: 3,
    possibleRewards: ["50-100 XP", "25-50 Moedas", "Item Comum"],
  },
  {
    id: "2",
    name: "Baú de Conquista",
    rarity: "rare",
    status: "available",
    keysRequired: 3,
    keysOwned: 3,
    possibleRewards: ["200-400 XP", "100-200 Moedas", "Item Raro"],
  },
  {
    id: "3",
    name: "Baú Épico",
    rarity: "epic",
    status: "cooldown",
    unlocksIn: "4h 32m",
    keysRequired: 5,
    keysOwned: 3,
    possibleRewards: ["500-1000 XP", "250-500 Moedas", "Item Épico", "Badge"],
  },
  {
    id: "4",
    name: "Baú Lendário",
    rarity: "legendary",
    status: "locked",
    keysRequired: 10,
    keysOwned: 3,
    possibleRewards: ["2000-5000 XP", "1000-2500 Moedas", "Item Lendário", "Título Exclusivo"],
  },
];

const rarityConfig = {
  common: { 
    label: "Comum", 
    gradient: "from-gray-400 to-gray-500",
    glow: "shadow-gray-500/30",
    border: "border-gray-400/50",
    bg: "bg-gray-500/10"
  },
  rare: { 
    label: "Raro", 
    gradient: "from-blue-400 to-blue-600",
    glow: "shadow-blue-500/30",
    border: "border-blue-500/50",
    bg: "bg-blue-500/10"
  },
  epic: { 
    label: "Épico", 
    gradient: "from-purple-400 to-purple-600",
    glow: "shadow-purple-500/30",
    border: "border-purple-500/50",
    bg: "bg-purple-500/10"
  },
  legendary: { 
    label: "Lendário", 
    gradient: "from-amber-400 via-orange-500 to-red-500",
    glow: "shadow-amber-500/50",
    border: "border-amber-500/50",
    bg: "bg-amber-500/10"
  },
};

export const RewardChest = memo(function RewardChest() {
  const [openingChest, setOpeningChest] = useState<string | null>(null);
  const [reward, setReward] = useState<Reward | null>(null);
  const [keysOwned] = useState(3);

  const handleOpenChest = (chest: Chest) => {
    if (chest.status !== "available" || chest.keysOwned < chest.keysRequired) return;
    
    setOpeningChest(chest.id);
    
    // Simulate opening animation
    setTimeout(() => {
      setReward({
        type: "xp",
        name: "Bônus de XP",
        amount: Math.floor(Math.random() * 200) + 100,
      });
    }, 1500);
  };

  const handleClaimReward = () => {
    setOpeningChest(null);
    setReward(null);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center"
              animate={{ rotateY: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Gift className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <span>Baús de Recompensa</span>
              <p className="text-xs font-normal text-muted-foreground">
                Abra para ganhar prêmios
              </p>
            </div>
          </div>

          <Badge variant="outline" className="gap-1">
            <Gem className="h-3 w-3 text-cyan-400" />
            {keysOwned} chaves
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {mockChests.map((chest) => {
            const config = rarityConfig[chest.rarity];
            const canOpen = chest.status === "available" && chest.keysOwned >= chest.keysRequired;
            const isOpening = openingChest === chest.id;

            return (
              <motion.div
                key={chest.id}
                whileHover={canOpen ? { scale: 1.02 } : undefined}
                className={cn(
                  "relative p-4 rounded-xl border transition-all",
                  config.border,
                  config.bg,
                  canOpen && "cursor-pointer hover:shadow-lg",
                  canOpen && config.glow
                )}
                onClick={() => handleOpenChest(chest)}
              >
                {/* Chest Icon */}
                <div className="flex justify-center mb-3">
                  <motion.div
                    className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg",
                      config.gradient
                    )}
                    animate={canOpen ? { y: [0, -5, 0] } : undefined}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {chest.status === "locked" ? (
                      <Lock className="h-7 w-7 text-white/80" />
                    ) : chest.status === "cooldown" ? (
                      <Clock className="h-7 w-7 text-white/80" />
                    ) : (
                      <Box className="h-7 w-7 text-white" />
                    )}
                  </motion.div>

                  {/* Sparkles for legendary */}
                  {chest.rarity === "legendary" && canOpen && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Sparkles className="absolute top-2 right-2 h-4 w-4 text-amber-400" />
                      <Sparkles className="absolute bottom-2 left-2 h-3 w-3 text-orange-400" />
                    </motion.div>
                  )}
                </div>

                {/* Info */}
                <div className="text-center space-y-1">
                  <h4 className="text-sm font-medium">{chest.name}</h4>
                  <Badge variant="outline" className={cn("text-[10px]", config.border)}>
                    {config.label}
                  </Badge>
                </div>

                {/* Status */}
                <div className="mt-3 text-center">
                  {chest.status === "available" ? (
                    <div className="flex items-center justify-center gap-1 text-xs">
                      <Gem className="h-3 w-3 text-cyan-400" />
                      <span className={cn(
                        keysOwned >= chest.keysRequired ? "text-green-500" : "text-muted-foreground"
                      )}>
                        {keysOwned}/{chest.keysRequired} chaves
                      </span>
                    </div>
                  ) : chest.status === "cooldown" ? (
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {chest.unlocksIn}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Lock className="h-3 w-3" />
                      {chest.keysRequired} chaves necessárias
                    </div>
                  )}
                </div>

                {/* Open Button */}
                {canOpen && (
                  <Button 
                    size="sm" 
                    className={cn("w-full mt-3 bg-gradient-to-r", config.gradient)}
                  >
                    <Unlock className="h-3.5 w-3.5 mr-1" />
                    Abrir
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Opening Animation Modal */}
        <AnimatePresence>
          {openingChest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
              onClick={reward ? handleClaimReward : undefined}
            >
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.5 }}
                className="text-center"
              >
                {!reward ? (
                  <motion.div
                    animate={{ 
                      rotateY: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 1.5,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/50">
                      <Box className="h-16 w-16 text-white" />
                    </div>
                    <p className="mt-4 text-white text-lg animate-pulse">Abrindo...</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="space-y-4"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto shadow-2xl shadow-yellow-500/50">
                        <Zap className="h-12 w-12 text-white" />
                      </div>
                    </motion.div>

                    <div className="text-white">
                      <h3 className="text-2xl font-bold mb-1">{reward.name}</h3>
                      <p className="text-4xl font-black text-yellow-400">
                        +{reward.amount} XP
                      </p>
                    </div>

                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute"
                          initial={{ 
                            x: "50%", 
                            y: "50%",
                            scale: 0
                          }}
                          animate={{ 
                            x: `${50 + (Math.random() - 0.5) * 100}%`,
                            y: `${50 + (Math.random() - 0.5) * 100}%`,
                            scale: [0, 1, 0],
                            opacity: [1, 1, 0]
                          }}
                          transition={{ 
                            duration: 1.5,
                            delay: i * 0.1
                          }}
                        >
                          <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                        </motion.div>
                      ))}
                    </motion.div>

                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold"
                      onClick={handleClaimReward}
                    >
                      <Crown className="h-5 w-5 mr-2" />
                      Resgatar!
                    </Button>

                    <p className="text-sm text-white/60">Toque para continuar</p>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How to get keys */}
        <div className="p-3 rounded-xl bg-muted/50 border border-dashed">
          <h5 className="text-xs font-medium flex items-center gap-2 mb-2">
            <Gem className="h-3.5 w-3.5 text-cyan-400" />
            Como conseguir chaves?
          </h5>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Complete missões diárias</li>
            <li>• Alcance marcos de streak</li>
            <li>• Conquiste achievements</li>
            <li>• Participe de eventos especiais</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
});
