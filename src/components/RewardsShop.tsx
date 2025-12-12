import { motion } from "framer-motion";
import { Gift, Star, Lock, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  image: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  available: boolean;
}

const rewards: Reward[] = [
  {
    id: "1",
    title: "Day Off",
    description: "Um dia de folga extra",
    cost: 5000,
    image: "🏖️",
    rarity: "legendary",
    available: false,
  },
  {
    id: "2",
    title: "Gift Card R$50",
    description: "Vale presente iFood",
    cost: 1200,
    image: "🎁",
    rarity: "rare",
    available: true,
  },
  {
    id: "3",
    title: "Badge Exclusivo",
    description: "Badge 'Early Adopter'",
    cost: 500,
    image: "🏅",
    rarity: "common",
    available: true,
  },
  {
    id: "4",
    title: "Curso Premium",
    description: "Acesso Udemy Business",
    cost: 3000,
    image: "📚",
    rarity: "epic",
    available: false,
  },
];

const rarityConfig = {
  common: {
    border: "border-muted-foreground/30",
    bg: "from-muted/30 to-transparent",
    badge: "bg-muted text-muted-foreground",
    label: "Comum",
    glow: "",
  },
  rare: {
    border: "border-secondary/50",
    bg: "from-secondary/20 to-transparent",
    badge: "bg-secondary/20 text-secondary",
    label: "Raro",
    glow: "",
  },
  epic: {
    border: "border-accent/50",
    bg: "from-accent/20 to-transparent",
    badge: "bg-accent/20 text-accent",
    label: "Épico",
    glow: "",
  },
  legendary: {
    border: "border-gold/50",
    bg: "from-gold/20 to-transparent",
    badge: "bg-gold/20 text-gold",
    label: "Lendário",
    glow: "shadow-[0_0_30px_hsl(var(--gold)/0.3)]",
  },
};

export const RewardsShop = () => {
  const userCoins = 1250;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-card rounded-2xl border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-coins/20 to-coins/5 flex items-center justify-center">
            <Gift className="w-4 h-4 text-coins" />
          </div>
          <div>
            <h3 className="font-bold">Recompensas</h3>
            <p className="text-xs text-muted-foreground">Troque suas coins</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-coins/10">
          <Star className="w-4 h-4 text-coins coin-shine" />
          <span className="font-bold text-coins">{userCoins.toLocaleString()}</span>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {rewards.map((reward, i) => {
          const config = rarityConfig[reward.rarity];
          const canAfford = userCoins >= reward.cost;

          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              whileHover={reward.available && canAfford ? { scale: 1.03, y: -4 } : {}}
              className={cn(
                "relative p-3 rounded-xl border transition-all duration-200",
                config.border,
                reward.rarity === "legendary" && config.glow,
                !reward.available && "opacity-60"
              )}
            >
              {/* Background gradient */}
              <div className={cn(
                "absolute inset-0 rounded-xl bg-gradient-to-b opacity-50",
                config.bg
              )} />

              <div className="relative z-10">
                {/* Rarity badge */}
                <div className="flex justify-between items-start mb-2">
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-bold",
                    config.badge
                  )}>
                    {config.label}
                  </span>
                  {reward.rarity === "legendary" && (
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="w-4 h-4 text-gold" />
                    </motion.div>
                  )}
                </div>

                {/* Image/Emoji */}
                <div className="text-3xl mb-2 text-center">{reward.image}</div>

                {/* Info */}
                <h4 className="font-semibold text-sm text-center mb-1">{reward.title}</h4>
                <p className="text-[10px] text-muted-foreground text-center mb-2 line-clamp-1">
                  {reward.description}
                </p>

                {/* Price/Action */}
                {reward.available ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!canAfford}
                    className={cn(
                      "w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors",
                      canAfford
                        ? "bg-coins/20 text-coins hover:bg-coins/30"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    <Star className="w-3 h-3" />
                    {reward.cost.toLocaleString()}
                  </motion.button>
                ) : (
                  <div className="w-full py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" />
                    Em breve
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* View All */}
      <div className="p-4 border-t border-border">
        <motion.button
          whileHover={{ x: 4 }}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Ver todas as recompensas
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};
