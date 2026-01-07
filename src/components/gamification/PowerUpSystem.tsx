import { memo, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, Clock, Shield, Flame, Star, Sparkles,
  TrendingUp, Target, Users, Brain, Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  rarity: "common" | "rare" | "epic" | "legendary";
  duration: number; // in minutes
  effect: string;
  multiplier: number;
  cooldown: number; // in hours
  owned: number;
  isActive: boolean;
  remainingTime?: number;
}

const mockPowerUps: PowerUp[] = [
  {
    id: "xp-boost",
    name: "XP Boost",
    description: "Dobra todo XP ganho",
    icon: TrendingUp,
    rarity: "common",
    duration: 30,
    effect: "2x XP",
    multiplier: 2,
    cooldown: 4,
    owned: 3,
    isActive: false
  },
  {
    id: "coin-rush",
    name: "Coin Rush",
    description: "Triplica moedas coletadas",
    icon: Sparkles,
    rarity: "rare",
    duration: 15,
    effect: "3x Moedas",
    multiplier: 3,
    cooldown: 6,
    owned: 1,
    isActive: true,
    remainingTime: 8
  },
  {
    id: "focus-shield",
    name: "Focus Shield",
    description: "Protege seu streak por 24h",
    icon: Shield,
    rarity: "epic",
    duration: 1440,
    effect: "Proteção Streak",
    multiplier: 1,
    cooldown: 24,
    owned: 2,
    isActive: false
  },
  {
    id: "team-spirit",
    name: "Team Spirit",
    description: "Bônus para toda a equipe",
    icon: Users,
    rarity: "legendary",
    duration: 60,
    effect: "1.5x Time",
    multiplier: 1.5,
    cooldown: 12,
    owned: 1,
    isActive: false
  },
  {
    id: "brain-power",
    name: "Brain Power",
    description: "Missões contam em dobro",
    icon: Brain,
    rarity: "epic",
    duration: 45,
    effect: "2x Missões",
    multiplier: 2,
    cooldown: 8,
    owned: 0,
    isActive: false
  },
  {
    id: "super-streak",
    name: "Super Streak",
    description: "Streak não quebra hoje",
    icon: Flame,
    rarity: "legendary",
    duration: 1440,
    effect: "Streak Imune",
    multiplier: 1,
    cooldown: 48,
    owned: 1,
    isActive: false
  }
];

const rarityConfig = {
  common: { 
    color: "text-slate-500", 
    bg: "bg-slate-500/10", 
    border: "border-slate-500/30",
    glow: "" 
  },
  rare: { 
    color: "text-blue-500", 
    bg: "bg-blue-500/10", 
    border: "border-blue-500/30",
    glow: "shadow-blue-500/20" 
  },
  epic: { 
    color: "text-purple-500", 
    bg: "bg-purple-500/10", 
    border: "border-purple-500/30",
    glow: "shadow-purple-500/30" 
  },
  legendary: { 
    color: "text-amber-500", 
    bg: "bg-gradient-to-br from-amber-500/20 to-orange-500/20", 
    border: "border-amber-500/50",
    glow: "shadow-amber-500/40 shadow-lg" 
  }
};

const PowerUpCard = memo(function PowerUpCard({ 
  powerUp, 
  onActivate 
}: { 
  powerUp: PowerUp;
  onActivate: (id: string) => void;
}) {
  const config = rarityConfig[powerUp.rarity];
  const Icon = powerUp.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "relative p-4 rounded-xl border-2 transition-all",
        config.bg,
        config.border,
        config.glow,
        powerUp.isActive && "ring-2 ring-primary ring-offset-2"
      )}
    >
      {/* Active Indicator */}
      {powerUp.isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-2 -right-2"
        >
          <Badge className="bg-green-500 text-white animate-pulse">
            <Zap className="w-3 h-3 mr-1" />
            ATIVO
          </Badge>
        </motion.div>
      )}

      {/* Rarity Badge */}
      <Badge 
        variant="outline" 
        className={cn("absolute top-2 left-2 text-[10px] capitalize", config.color, config.border)}
      >
        {powerUp.rarity}
      </Badge>

      {/* Icon */}
      <div className="flex justify-center mt-4 mb-3">
        <motion.div
          animate={powerUp.isActive ? { 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1]
          } : {}}
          transition={{ repeat: powerUp.isActive ? Infinity : 0, duration: 2 }}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center",
            config.bg,
            powerUp.isActive && "bg-primary/20"
          )}
        >
          <Icon className={cn(
            "w-8 h-8",
            powerUp.isActive ? "text-primary" : config.color
          )} />
        </motion.div>
      </div>

      {/* Info */}
      <div className="text-center mb-3">
        <h4 className="font-bold text-sm">{powerUp.name}</h4>
        <p className="text-xs text-muted-foreground mt-1">{powerUp.description}</p>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-4 mb-3">
        <div className="text-center">
          <p className={cn("font-bold text-sm", config.color)}>{powerUp.effect}</p>
          <p className="text-[10px] text-muted-foreground">Efeito</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-sm flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" />
            {powerUp.duration >= 60 ? `${powerUp.duration / 60}h` : `${powerUp.duration}m`}
          </p>
          <p className="text-[10px] text-muted-foreground">Duração</p>
        </div>
      </div>

      {/* Active Progress */}
      {powerUp.isActive && powerUp.remainingTime !== undefined && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Tempo restante</span>
            <span className="font-medium">{powerUp.remainingTime}m</span>
          </div>
          <Progress 
            value={(powerUp.remainingTime / powerUp.duration) * 100} 
            className="h-2"
          />
        </div>
      )}

      {/* Action */}
      <Button
        size="sm"
        className="w-full"
        variant={powerUp.isActive ? "secondary" : "default"}
        disabled={powerUp.owned === 0 || powerUp.isActive}
        onClick={() => onActivate(powerUp.id)}
      >
        {powerUp.isActive ? (
          <>
            <Zap className="w-3 h-3 mr-1" />
            Em uso
          </>
        ) : powerUp.owned === 0 ? (
          "Sem estoque"
        ) : (
          <>
            <Rocket className="w-3 h-3 mr-1" />
            Ativar ({powerUp.owned}x)
          </>
        )}
      </Button>
    </motion.div>
  );
});

export const PowerUpSystem = memo(function PowerUpSystem({ 
  className 
}: { 
  className?: string;
}) {
  const [powerUps, setPowerUps] = useState<PowerUp[]>(mockPowerUps);

  const activePowerUps = useMemo(() => 
    powerUps.filter(p => p.isActive),
    [powerUps]
  );

  const handleActivate = useCallback((id: string) => {
    setPowerUps(prev => prev.map(p => 
      p.id === id && p.owned > 0 
        ? { ...p, isActive: true, owned: p.owned - 1, remainingTime: p.duration }
        : p
    ));
  }, []);

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Power-Ups</CardTitle>
              <p className="text-xs text-muted-foreground">
                {activePowerUps.length} ativo{activePowerUps.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          
          {activePowerUps.length > 0 && (
            <div className="flex -space-x-2">
              {activePowerUps.slice(0, 3).map(p => {
                const Icon = p.icon;
                return (
                  <motion.div
                    key={p.id}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center"
                  >
                    <Icon className="w-4 h-4 text-primary" />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <AnimatePresence>
            {powerUps.map(powerUp => (
              <PowerUpCard
                key={powerUp.id}
                powerUp={powerUp}
                onActivate={handleActivate}
              />
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
});

export default PowerUpSystem;
