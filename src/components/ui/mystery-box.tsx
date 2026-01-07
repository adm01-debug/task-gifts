import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
  Package, Sparkles, Star, Zap, Coins, 
  Trophy, Gift, Lock, Timer
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MysteryReward {
  type: "xp" | "coins" | "badge" | "powerup";
  value: number | string;
  rarity: "common" | "rare" | "epic" | "legendary";
  name: string;
}

interface MysteryBoxProps {
  isAvailable?: boolean;
  cooldownMinutes?: number;
  onOpen?: () => Promise<MysteryReward>;
  className?: string;
}

const rarityConfig = {
  common: {
    color: "from-gray-400 to-gray-500",
    glow: "shadow-gray-500/30",
    text: "text-gray-500",
    bg: "bg-gray-500/10",
    label: "Comum",
  },
  rare: {
    color: "from-blue-400 to-blue-600",
    glow: "shadow-blue-500/30",
    text: "text-blue-500",
    bg: "bg-blue-500/10",
    label: "Raro",
  },
  epic: {
    color: "from-purple-400 to-purple-600",
    glow: "shadow-purple-500/30",
    text: "text-purple-500",
    bg: "bg-purple-500/10",
    label: "Épico",
  },
  legendary: {
    color: "from-amber-400 to-orange-500",
    glow: "shadow-amber-500/50",
    text: "text-amber-500",
    bg: "bg-amber-500/10",
    label: "Lendário",
  },
};

const rewardIcons = {
  xp: Zap,
  coins: Coins,
  badge: Trophy,
  powerup: Star,
};

/**
 * MysteryBox - Animated mystery box with reveal animation
 */
export function MysteryBox({
  isAvailable = true,
  cooldownMinutes = 0,
  onOpen,
  className,
}: MysteryBoxProps) {
  const [state, setState] = useState<"idle" | "opening" | "revealing" | "revealed">("idle");
  const [reward, setReward] = useState<MysteryReward | null>(null);

  const handleOpen = async () => {
    if (!isAvailable || state !== "idle") return;

    setState("opening");
    
    // Simulate opening animation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setState("revealing");
    
    // Get reward
    const newReward = onOpen ? await onOpen() : {
      type: "xp" as const,
      value: Math.floor(Math.random() * 200) + 50,
      rarity: ["common", "rare", "epic", "legendary"][Math.floor(Math.random() * 4)] as MysteryReward["rarity"],
      name: "Bônus de XP",
    };
    
    setReward(newReward);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setState("revealed");
  };

  const handleReset = () => {
    setState("idle");
    setReward(null);
  };

  const config = reward ? rarityConfig[reward.rarity] : null;
  const RewardIcon = reward ? rewardIcons[reward.type] : Gift;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          {/* Box Container */}
          <div className="relative w-32 h-32 mb-4">
            <AnimatePresence mode="wait">
              {state === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  className="absolute inset-0"
                >
                  <motion.div
                    animate={{ 
                      y: [0, -5, 0],
                      rotateY: [0, 5, 0, -5, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className={cn(
                      "w-full h-full rounded-2xl flex items-center justify-center",
                      "bg-gradient-to-br from-purple-500 to-indigo-600",
                      "shadow-2xl shadow-purple-500/30",
                      !isAvailable && "opacity-50 grayscale"
                    )}
                  >
                    <Package className="w-16 h-16 text-white" />
                    
                    {/* Sparkle effects */}
                    {isAvailable && (
                      <>
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute"
                            animate={{
                              opacity: [0, 1, 0],
                              scale: [0.5, 1, 0.5],
                              x: [0, (i - 1) * 30],
                              y: [0, -20 - i * 10],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.4,
                            }}
                          >
                            <Sparkles className="w-4 h-4 text-amber-300" />
                          </motion.div>
                        ))}
                      </>
                    )}
                    
                    {!isAvailable && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}

              {state === "opening" && (
                <motion.div
                  key="opening"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <motion.div
                    animate={{ 
                      rotateY: [0, 360],
                      scale: [1, 1.2, 1, 1.3, 1],
                    }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="w-full h-full rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/50"
                  >
                    <Package className="w-16 h-16 text-white" />
                  </motion.div>
                  
                  {/* Explosion particles */}
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, x: 0, y: 0 }}
                      animate={{
                        scale: [0, 1, 0],
                        x: Math.cos((i * 30 * Math.PI) / 180) * 60,
                        y: Math.sin((i * 30 * Math.PI) / 180) * 60,
                      }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.05 }}
                      className="absolute w-3 h-3 rounded-full"
                      style={{
                        background: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'][i % 4],
                      }}
                    />
                  ))}
                </motion.div>
              )}

              {(state === "revealing" || state === "revealed") && reward && (
                <motion.div
                  key="revealed"
                  initial={{ scale: 0, rotateY: 180 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <motion.div
                    animate={state === "revealed" ? { 
                      boxShadow: [
                        `0 0 20px 0px ${config?.glow}`,
                        `0 0 40px 10px ${config?.glow}`,
                        `0 0 20px 0px ${config?.glow}`,
                      ]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={cn(
                      "w-full h-full rounded-2xl flex flex-col items-center justify-center",
                      `bg-gradient-to-br ${config?.color}`,
                      "shadow-2xl"
                    )}
                  >
                    <RewardIcon className="w-12 h-12 text-white mb-2" />
                    <span className="text-white font-bold text-lg">
                      {typeof reward.value === "number" ? `+${reward.value}` : reward.value}
                    </span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Labels and Actions */}
          {state === "idle" && (
            <>
              <h3 className="font-bold text-lg mb-1">Caixa Misteriosa</h3>
              {isAvailable ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    Abra para revelar sua recompensa!
                  </p>
                  <Button
                    onClick={handleOpen}
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Abrir Caixa
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Timer className="w-4 h-4" />
                  <span>Disponível em {cooldownMinutes} minutos</span>
                </div>
              )}
            </>
          )}

          {state === "opening" && (
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5 text-amber-500" />
              </motion.div>
              <span className="font-medium">Abrindo...</span>
            </div>
          )}

          {state === "revealed" && reward && config && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className={cn(
                "inline-flex items-center gap-1 px-3 py-1 rounded-full mb-2",
                config.bg
              )}>
                <Star className={cn("w-3 h-3", config.text)} />
                <span className={cn("text-xs font-bold", config.text)}>
                  {config.label}
                </span>
              </div>
              <h3 className="font-bold text-lg">{reward.name}</h3>
              <p className="text-2xl font-bold text-primary mt-1">
                {typeof reward.value === "number" ? `+${reward.value}` : reward.value}
                {reward.type === "xp" && " XP"}
                {reward.type === "coins" && " Coins"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="mt-4"
              >
                Fechar
              </Button>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * MiniMysteryBox - Compact indicator for available boxes
 */
export function MiniMysteryBox({
  count = 1,
  onClick,
}: {
  count?: number;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="relative p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Package className="w-5 h-5 text-purple-500" />
      </motion.div>
      
      {count > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground"
        >
          {count}
        </motion.div>
      )}
    </motion.button>
  );
}
