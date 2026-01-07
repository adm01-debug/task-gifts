import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Sparkles, Crown, Star, Coins, Gift, Gem } from "lucide-react";

type Rarity = "common" | "rare" | "epic" | "legendary";

interface LootItem {
  id: string;
  name: string;
  type: "coins" | "xp" | "badge" | "title" | "avatar";
  value: number | string;
  rarity: Rarity;
  icon: typeof Coins;
}

const rarityConfig: Record<Rarity, { color: string; glow: string; bg: string }> = {
  common: { color: "text-slate-400", glow: "shadow-slate-500/50", bg: "from-slate-500/20 to-slate-600/20" },
  rare: { color: "text-blue-400", glow: "shadow-blue-500/50", bg: "from-blue-500/20 to-blue-600/20" },
  epic: { color: "text-purple-400", glow: "shadow-purple-500/50", bg: "from-purple-500/20 to-purple-600/20" },
  legendary: { color: "text-amber-400", glow: "shadow-amber-500/50", bg: "from-amber-500/20 to-orange-600/20" },
};

const possibleItems: LootItem[] = [
  { id: "1", name: "100 Moedas", type: "coins", value: 100, rarity: "common", icon: Coins },
  { id: "2", name: "500 XP", type: "xp", value: 500, rarity: "rare", icon: Star },
  { id: "3", name: "Badge Explorador", type: "badge", value: "explorer", rarity: "epic", icon: Crown },
  { id: "4", name: "1000 Moedas", type: "coins", value: 1000, rarity: "legendary", icon: Gem },
];

export function LootBox() {
  const [isOpening, setIsOpening] = useState(false);
  const [revealedItem, setRevealedItem] = useState<LootItem | null>(null);
  const [boxCount] = useState(3);

  const openBox = () => {
    setIsOpening(true);
    
    // Simulate opening animation
    setTimeout(() => {
      const randomItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
      setRevealedItem(randomItem);
    }, 2000);
  };

  const closeReveal = () => {
    setRevealedItem(null);
    setIsOpening(false);
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5 text-primary" />
            Caixas de Recompensa
            <Badge variant="secondary" className="ml-auto">
              {boxCount} disponíveis
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Loot Boxes Display */}
          <div className="flex justify-center gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <motion.div
                key={index}
                className={`
                  relative w-20 h-24 rounded-lg border-2 cursor-pointer
                  ${index < boxCount 
                    ? "border-primary bg-gradient-to-b from-primary/20 to-primary/5" 
                    : "border-muted bg-muted/20 opacity-50"
                  }
                `}
                whileHover={index < boxCount ? { scale: 1.05, y: -5 } : {}}
                whileTap={index < boxCount ? { scale: 0.95 } : {}}
                onClick={() => index < boxCount && !isOpening && openBox()}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Gift className={`h-10 w-10 ${index < boxCount ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                {index < boxCount && (
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-primary/10"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                <div className="absolute -top-2 -right-2">
                  <Sparkles className={`h-4 w-4 ${index < boxCount ? "text-amber-500" : "text-muted"}`} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Rarity Legend */}
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            {Object.entries(rarityConfig).map(([rarity, config]) => (
              <span key={rarity} className={`flex items-center gap-1 ${config.color}`}>
                <span className="w-2 h-2 rounded-full bg-current" />
                {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
              </span>
            ))}
          </div>

          {/* Open Button */}
          <Button 
            className="w-full" 
            disabled={boxCount === 0 || isOpening}
            onClick={openBox}
          >
            <Package className="h-4 w-4 mr-2" />
            Abrir Caixa
          </Button>
        </CardContent>
      </Card>

      {/* Opening Animation Overlay */}
      <AnimatePresence>
        {isOpening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md"
            onClick={revealedItem ? closeReveal : undefined}
          >
            {!revealedItem ? (
              // Opening Animation
              <motion.div
                className="relative"
                animate={{ 
                  rotateY: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Package className="h-32 w-32 text-primary" />
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/30 blur-xl"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              </motion.div>
            ) : (
              // Revealed Item
              <motion.div
                initial={{ scale: 0, rotateY: -180 }}
                animate={{ scale: 1, rotateY: 0 }}
                className="text-center space-y-6"
              >
                <motion.div
                  className={`
                    relative p-8 rounded-2xl border-2
                    bg-gradient-to-b ${rarityConfig[revealedItem.rarity].bg}
                    ${rarityConfig[revealedItem.rarity].color}
                    shadow-2xl ${rarityConfig[revealedItem.rarity].glow}
                  `}
                  animate={{ 
                    boxShadow: [
                      `0 0 20px ${revealedItem.rarity === 'legendary' ? '#f59e0b50' : '#6366f150'}`,
                      `0 0 40px ${revealedItem.rarity === 'legendary' ? '#f59e0b80' : '#6366f180'}`,
                      `0 0 20px ${revealedItem.rarity === 'legendary' ? '#f59e0b50' : '#6366f150'}`
                    ]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <revealedItem.icon className="h-20 w-20 mx-auto" />
                </motion.div>

                <div className="space-y-2">
                  <Badge className={`text-lg px-4 py-1 ${rarityConfig[revealedItem.rarity].color}`}>
                    {revealedItem.rarity.toUpperCase()}
                  </Badge>
                  <h3 className="text-2xl font-bold">{revealedItem.name}</h3>
                  <p className="text-muted-foreground">Clique para fechar</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
