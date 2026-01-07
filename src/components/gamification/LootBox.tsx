import { useState, useMemo, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  Sparkles, 
  Crown, 
  Star, 
  Coins, 
  Gift, 
  Gem,
  Zap,
  Trophy,
  Lock,
  Clock,
  TrendingUp,
  PartyPopper,
  Flame,
  Shield
} from "lucide-react";

type Rarity = "common" | "rare" | "epic" | "legendary";

interface LootItem {
  id: string;
  name: string;
  type: "coins" | "xp" | "badge" | "title" | "avatar" | "powerup";
  value: number | string;
  rarity: Rarity;
  icon: typeof Coins;
  description?: string;
}

const rarityConfig: Record<Rarity, { 
  color: string; 
  glow: string; 
  bg: string; 
  border: string;
  label: string;
  chance: string;
}> = {
  common: { 
    color: "text-slate-400", 
    glow: "shadow-slate-500/50", 
    bg: "from-slate-500/20 to-slate-600/20",
    border: "border-slate-500/50",
    label: "Comum",
    chance: "50%"
  },
  rare: { 
    color: "text-blue-500", 
    glow: "shadow-blue-500/50", 
    bg: "from-blue-500/20 to-blue-600/20",
    border: "border-blue-500/50",
    label: "Raro",
    chance: "30%"
  },
  epic: { 
    color: "text-purple-500", 
    glow: "shadow-purple-500/50", 
    bg: "from-purple-500/20 to-purple-600/20",
    border: "border-purple-500/50",
    label: "Épico",
    chance: "15%"
  },
  legendary: { 
    color: "text-amber-500", 
    glow: "shadow-amber-500/50", 
    bg: "from-amber-500/20 to-orange-600/20",
    border: "border-amber-500/50",
    label: "Lendário",
    chance: "5%"
  },
};

const possibleItems: LootItem[] = [
  { id: "1", name: "50 Moedas", type: "coins", value: 50, rarity: "common", icon: Coins, description: "Moedas para a loja" },
  { id: "2", name: "100 Moedas", type: "coins", value: 100, rarity: "common", icon: Coins, description: "Moedas para a loja" },
  { id: "3", name: "250 XP", type: "xp", value: 250, rarity: "common", icon: Star, description: "Experiência extra" },
  { id: "4", name: "500 XP", type: "xp", value: 500, rarity: "rare", icon: Star, description: "Experiência extra" },
  { id: "5", name: "500 Moedas", type: "coins", value: 500, rarity: "rare", icon: Coins, description: "Moedas para a loja" },
  { id: "6", name: "Boost 2x XP", type: "powerup", value: "2x", rarity: "rare", icon: Zap, description: "1 hora de XP dobrado" },
  { id: "7", name: "Badge Explorador", type: "badge", value: "explorer", rarity: "epic", icon: Crown, description: "Badge exclusivo" },
  { id: "8", name: "Título Mestre", type: "title", value: "master", rarity: "epic", icon: Trophy, description: "Título especial" },
  { id: "9", name: "1000 Moedas", type: "coins", value: 1000, rarity: "epic", icon: Gem, description: "Tesouro de moedas" },
  { id: "10", name: "2000 Moedas", type: "coins", value: 2000, rarity: "legendary", icon: Gem, description: "Fortuna lendária" },
  { id: "11", name: "Avatar Dourado", type: "avatar", value: "golden", rarity: "legendary", icon: Crown, description: "Avatar exclusivo" },
  { id: "12", name: "Escudo Lendário", type: "badge", value: "shield", rarity: "legendary", icon: Shield, description: "Badge lendário" },
];

interface LootBoxCardProps {
  index: number;
  isAvailable: boolean;
  isOpening: boolean;
  onOpen: () => void;
}

const LootBoxCard = memo(function LootBoxCard({ index, isAvailable, isOpening, onOpen }: LootBoxCardProps) {
  return (
    <motion.div
      className={`
        relative w-24 h-28 rounded-xl border-2 cursor-pointer overflow-hidden
        ${isAvailable 
          ? "border-primary/50 bg-gradient-to-b from-primary/20 via-primary/10 to-primary/5" 
          : "border-muted/50 bg-muted/10 opacity-40"
        }
      `}
      whileHover={isAvailable && !isOpening ? { scale: 1.08, y: -8, rotateY: 10 } : {}}
      whileTap={isAvailable && !isOpening ? { scale: 0.95 } : {}}
      onClick={() => isAvailable && !isOpening && onOpen()}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Glow effect */}
      {isAvailable && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
        />
      )}

      {/* Gift Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={isAvailable ? { y: [0, -3, 0], rotate: [0, 5, -5, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
        >
          {isAvailable ? (
            <Gift className="h-12 w-12 text-primary drop-shadow-lg" />
          ) : (
            <Lock className="h-10 w-10 text-muted-foreground/50" />
          )}
        </motion.div>
      </div>

      {/* Sparkles */}
      {isAvailable && (
        <>
          <motion.div
            className="absolute top-1 right-1"
            animate={{ rotate: [0, 180], scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
          </motion.div>
          <motion.div
            className="absolute bottom-2 left-1"
            animate={{ rotate: [180, 0], scale: [1, 1.3, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          >
            <Sparkles className="h-3 w-3 text-primary" />
          </motion.div>
        </>
      )}

      {/* Ribbon */}
      {isAvailable && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2">
          <div className="w-4 h-6 bg-gradient-to-b from-amber-500 to-orange-500 rounded-b-sm" />
        </div>
      )}

      {/* Number Badge */}
      <div className={`
        absolute bottom-1 left-1/2 -translate-x-1/2 
        px-2 py-0.5 rounded-full text-xs font-bold
        ${isAvailable ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
      `}>
        #{index + 1}
      </div>
    </motion.div>
  );
});

interface RevealOverlayProps {
  item: LootItem;
  onClose: () => void;
}

const RevealOverlay = memo(function RevealOverlay({ item, onClose }: RevealOverlayProps) {
  const config = rarityConfig[item.rarity];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl"
      onClick={onClose}
    >
      {/* Background Rays */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute top-1/2 left-1/2 w-1 h-[200vh] origin-top ${config.color} opacity-20`}
            style={{ rotate: `${i * 30}deg` }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
          />
        ))}
      </motion.div>

      {/* Particle Effects */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ 
            opacity: 0, 
            scale: 0,
            x: 0,
            y: 0
          }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1, 0.5],
            x: Math.cos(i * 18 * Math.PI / 180) * (100 + Math.random() * 100),
            y: Math.sin(i * 18 * Math.PI / 180) * (100 + Math.random() * 100) - 50
          }}
          transition={{ 
            duration: 1.5, 
            delay: 0.5 + i * 0.03,
            ease: "easeOut"
          }}
        >
          {i % 4 === 0 ? (
            <Star className={`h-4 w-4 ${config.color}`} />
          ) : i % 4 === 1 ? (
            <Sparkles className={`h-3 w-3 ${config.color}`} />
          ) : i % 4 === 2 ? (
            <Gem className={`h-3 w-3 ${config.color}`} />
          ) : (
            <div className={`w-2 h-2 rounded-full bg-current ${config.color}`} />
          )}
        </motion.div>
      ))}

      {/* Main Card */}
      <motion.div
        initial={{ scale: 0, rotateY: -180, rotateX: 20 }}
        animate={{ scale: 1, rotateY: 0, rotateX: 0 }}
        transition={{ type: "spring", damping: 12, delay: 0.2 }}
        className="relative text-center space-y-6 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Item Container */}
        <motion.div
          className={`
            relative p-10 rounded-3xl border-2 ${config.border}
            bg-gradient-to-br ${config.bg}
            shadow-2xl
          `}
          animate={{ 
            boxShadow: [
              `0 0 30px ${item.rarity === 'legendary' ? 'rgba(245, 158, 11, 0.3)' : item.rarity === 'epic' ? 'rgba(168, 85, 247, 0.3)' : item.rarity === 'rare' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(100, 116, 139, 0.3)'}`,
              `0 0 60px ${item.rarity === 'legendary' ? 'rgba(245, 158, 11, 0.5)' : item.rarity === 'epic' ? 'rgba(168, 85, 247, 0.5)' : item.rarity === 'rare' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(100, 116, 139, 0.5)'}`,
              `0 0 30px ${item.rarity === 'legendary' ? 'rgba(245, 158, 11, 0.3)' : item.rarity === 'epic' ? 'rgba(168, 85, 247, 0.3)' : item.rarity === 'rare' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(100, 116, 139, 0.3)'}`
            ]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {/* Rarity Badge */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2"
          >
            <Badge className={`text-sm px-4 py-1 ${
              item.rarity === 'legendary' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
              item.rarity === 'epic' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
              item.rarity === 'rare' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
              'bg-gradient-to-r from-slate-500 to-slate-600'
            }`}>
              {config.label.toUpperCase()}
            </Badge>
          </motion.div>

          {/* Icon */}
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <item.icon className={`h-24 w-24 mx-auto ${config.color} drop-shadow-2xl`} />
          </motion.div>

          {/* Glow Ring */}
          <motion.div
            className={`absolute inset-4 rounded-2xl border ${config.border} opacity-50`}
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Item Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-center gap-2">
            <PartyPopper className="h-5 w-5 text-amber-500" />
            <h3 className={`text-3xl font-bold ${config.color}`}>{item.name}</h3>
            <PartyPopper className="h-5 w-5 text-amber-500 scale-x-[-1]" />
          </div>
          
          {item.description && (
            <p className="text-muted-foreground">{item.description}</p>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-sm text-muted-foreground/70"
          >
            Toque para fechar
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
});

const OpeningAnimation = memo(function OpeningAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl"
    >
      <div className="relative">
        {/* Spinning Package */}
        <motion.div
          animate={{ 
            rotateY: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          <Package className="h-32 w-32 text-primary drop-shadow-2xl" />
        </motion.div>

        {/* Pulsing Glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/30 blur-3xl"
          animate={{ 
            scale: [1, 2, 1], 
            opacity: [0.3, 0.7, 0.3] 
          }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />

        {/* Orbiting Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2"
            animate={{ 
              rotate: 360 
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "linear",
              delay: i * 0.2
            }}
            style={{ 
              transformOrigin: "0 0"
            }}
          >
            <motion.div
              style={{ x: 60, y: -8 }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
            </motion.div>
          </motion.div>
        ))}

        {/* Loading Text */}
        <motion.p
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-lg font-medium text-muted-foreground whitespace-nowrap"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          Abrindo caixa...
        </motion.p>
      </div>
    </motion.div>
  );
});

export const LootBox = memo(function LootBox() {
  const [isOpening, setIsOpening] = useState(false);
  const [revealedItem, setRevealedItem] = useState<LootItem | null>(null);
  const [boxCount, setBoxCount] = useState(3);
  const [openedHistory, setOpenedHistory] = useState<LootItem[]>([]);
  const [pityCounter, setPityCounter] = useState(0);

  // Pity system - guaranteed legendary after 10 boxes without one
  const pityProgress = useMemo(() => (pityCounter / 10) * 100, [pityCounter]);

  const stats = useMemo(() => ({
    total: openedHistory.length,
    legendary: openedHistory.filter(i => i.rarity === 'legendary').length,
    epic: openedHistory.filter(i => i.rarity === 'epic').length,
    rare: openedHistory.filter(i => i.rarity === 'rare').length,
  }), [openedHistory]);

  const getRandomItem = useCallback((): LootItem => {
    // Pity system - guaranteed legendary
    if (pityCounter >= 9) {
      setPityCounter(0);
      return possibleItems.filter(i => i.rarity === 'legendary')[
        Math.floor(Math.random() * possibleItems.filter(i => i.rarity === 'legendary').length)
      ];
    }

    const rand = Math.random() * 100;
    let rarity: Rarity;
    
    if (rand < 5) rarity = 'legendary';
    else if (rand < 20) rarity = 'epic';
    else if (rand < 50) rarity = 'rare';
    else rarity = 'common';

    const itemsOfRarity = possibleItems.filter(i => i.rarity === rarity);
    const item = itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)];

    if (rarity !== 'legendary') {
      setPityCounter(prev => prev + 1);
    } else {
      setPityCounter(0);
    }

    return item;
  }, [pityCounter]);

  const openBox = useCallback(() => {
    if (boxCount === 0 || isOpening) return;

    setIsOpening(true);
    
    setTimeout(() => {
      const item = getRandomItem();
      setRevealedItem(item);
      setOpenedHistory(prev => [item, ...prev].slice(0, 10));
      setBoxCount(prev => prev - 1);
    }, 2000);
  }, [boxCount, isOpening, getRandomItem]);

  const closeReveal = useCallback(() => {
    setRevealedItem(null);
    setIsOpening(false);
  }, []);

  return (
    <>
      <Card className="overflow-hidden border-primary/20">
        {/* Premium Header */}
        <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Package className="h-5 w-5 text-primary" />
              </motion.div>
              Caixas de Recompensa
            </CardTitle>
            <Badge className="bg-gradient-to-r from-primary to-primary/80">
              <Gift className="h-3 w-3 mr-1" />
              {boxCount} disponíveis
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-4">
          {/* Loot Boxes Display */}
          <div className="flex justify-center gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <LootBoxCard
                key={index}
                index={index}
                isAvailable={index < boxCount}
                isOpening={isOpening}
                onOpen={openBox}
              />
            ))}
          </div>

          {/* Pity System Progress */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Garantia Lendário</span>
              </div>
              <span className="text-xs text-muted-foreground">{pityCounter}/10</span>
            </div>
            <Progress value={pityProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Lendário garantido após 10 aberturas sem um
            </p>
          </div>

          {/* Rarity Legend */}
          <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
            <p className="text-xs font-medium text-muted-foreground mb-2">Chances de Drop</p>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(rarityConfig).map(([rarity, config]) => (
                <motion.div
                  key={rarity}
                  whileHover={{ scale: 1.05 }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg bg-gradient-to-br ${config.bg} border ${config.border}`}
                >
                  <span className={`w-3 h-3 rounded-full ${
                    rarity === 'legendary' ? 'bg-amber-500' :
                    rarity === 'epic' ? 'bg-purple-500' :
                    rarity === 'rare' ? 'bg-blue-500' :
                    'bg-slate-500'
                  }`} />
                  <span className="text-xs font-medium">{config.label}</span>
                  <span className="text-[10px] text-muted-foreground">{config.chance}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats */}
          {stats.total > 0 && (
            <div className="grid grid-cols-4 gap-2">
              <div className="p-2 rounded-lg bg-muted/30 text-center">
                <p className="text-lg font-bold">{stats.total}</p>
                <p className="text-[10px] text-muted-foreground">Abertas</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10 text-center">
                <p className="text-lg font-bold text-amber-500">{stats.legendary}</p>
                <p className="text-[10px] text-muted-foreground">Lendárias</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-500/10 text-center">
                <p className="text-lg font-bold text-purple-500">{stats.epic}</p>
                <p className="text-[10px] text-muted-foreground">Épicas</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10 text-center">
                <p className="text-lg font-bold text-blue-500">{stats.rare}</p>
                <p className="text-[10px] text-muted-foreground">Raras</p>
              </div>
            </div>
          )}

          {/* Recent Drops */}
          {openedHistory.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Últimos Drops</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {openedHistory.slice(0, 5).map((item, index) => (
                  <motion.div
                    key={`${item.id}-${index}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      flex-shrink-0 p-2 rounded-lg border
                      bg-gradient-to-br ${rarityConfig[item.rarity].bg}
                      ${rarityConfig[item.rarity].border}
                    `}
                  >
                    <item.icon className={`h-5 w-5 ${rarityConfig[item.rarity].color}`} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Open Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              className="w-full relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" 
              size="lg"
              disabled={boxCount === 0 || isOpening}
              onClick={openBox}
            >
              {boxCount > 0 && !isOpening && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              <Zap className="h-5 w-5 mr-2" />
              {boxCount === 0 ? "Sem Caixas" : isOpening ? "Abrindo..." : "Abrir Caixa"}
            </Button>
          </motion.div>

          {/* Next Box Timer */}
          {boxCount === 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Próxima caixa em 23:45:12</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overlays */}
      <AnimatePresence>
        {isOpening && !revealedItem && <OpeningAnimation />}
        {revealedItem && <RevealOverlay item={revealedItem} onClose={closeReveal} />}
      </AnimatePresence>
    </>
  );
});

export default LootBox;
