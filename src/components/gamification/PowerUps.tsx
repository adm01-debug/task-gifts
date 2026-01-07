import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Rocket, 
  Zap, 
  Star,
  Shield,
  Clock,
  Sparkles,
  Gift,
  ChevronRight,
  Timer,
  TrendingUp,
  Coins
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  type: "boost" | "protection" | "bonus";
  effect: string;
  duration: string;
  owned: number;
  active: boolean;
  remainingTime?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  color: string;
}

const mockPowerUps: PowerUp[] = [
  {
    id: "xp-boost",
    name: "XP Boost",
    description: "Aumenta XP ganho em todas as atividades",
    icon: <Zap className="h-5 w-5" />,
    type: "boost",
    effect: "+50% XP",
    duration: "2 horas",
    owned: 3,
    active: true,
    remainingTime: "1h 23m",
    rarity: "rare",
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "coin-multiplier",
    name: "Multiplicador de Moedas",
    description: "Dobra as moedas ganhas",
    icon: <Coins className="h-5 w-5" />,
    type: "bonus",
    effect: "2x Moedas",
    duration: "1 hora",
    owned: 2,
    active: false,
    rarity: "epic",
    color: "from-amber-500 to-yellow-500",
  },
  {
    id: "streak-shield",
    name: "Escudo de Streak",
    description: "Protege seu streak por um dia",
    icon: <Shield className="h-5 w-5" />,
    type: "protection",
    effect: "Proteção Total",
    duration: "24 horas",
    owned: 1,
    active: false,
    rarity: "epic",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "time-freeze",
    name: "Congelar Tempo",
    description: "Pausa contadores de prazo",
    icon: <Timer className="h-5 w-5" />,
    type: "protection",
    effect: "Pausar Prazos",
    duration: "4 horas",
    owned: 0,
    active: false,
    rarity: "legendary",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "super-boost",
    name: "Super Boost",
    description: "Boost extremo em todas as recompensas",
    icon: <Rocket className="h-5 w-5" />,
    type: "boost",
    effect: "+100% Tudo",
    duration: "30 min",
    owned: 0,
    active: false,
    rarity: "legendary",
    color: "from-red-500 to-orange-500",
  },
];

const rarityConfig = {
  common: { label: "Comum", border: "border-gray-400/50" },
  rare: { label: "Raro", border: "border-blue-500/50" },
  epic: { label: "Épico", border: "border-purple-500/50" },
  legendary: { label: "Lendário", border: "border-amber-500/50" },
};

export const PowerUps = memo(function PowerUps() {
  const [selectedPowerUp, setSelectedPowerUp] = useState<PowerUp | null>(null);
  const activePowerUps = mockPowerUps.filter(p => p.active);

  const handleActivate = (powerUp: PowerUp) => {
    console.log("Activating:", powerUp.name);
    setSelectedPowerUp(null);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <span>Power-Ups</span>
              <p className="text-xs font-normal text-muted-foreground">
                Potencialize suas recompensas
              </p>
            </div>
          </div>
          {activePowerUps.length > 0 && (
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse">
              {activePowerUps.length} Ativo(s)
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Active Power-Ups */}
        {activePowerUps.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-green-500" />
              Ativos Agora
            </h4>
            
            {activePowerUps.map((powerUp) => (
              <motion.div
                key={powerUp.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  "p-3 rounded-xl border-2 bg-gradient-to-r",
                  powerUp.color,
                  "bg-opacity-10"
                )}
                style={{ 
                  background: `linear-gradient(to right, var(--tw-gradient-stops))`,
                  opacity: 0.15
                }}
              >
                <div className="flex items-center justify-between relative">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br",
                      powerUp.color
                    )}>
                      {powerUp.icon}
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">{powerUp.name}</h5>
                      <p className="text-xs text-muted-foreground">{powerUp.effect}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs mb-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {powerUp.remainingTime}
                    </Badge>
                    <Progress value={70} className="h-1 w-16" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Available Power-Ups */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Gift className="h-3.5 w-3.5" />
            Disponíveis
          </h4>

          <div className="grid gap-2">
            {mockPowerUps.filter(p => !p.active).map((powerUp, index) => {
              const config = rarityConfig[powerUp.rarity];

              return (
                <motion.div
                  key={powerUp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-3 rounded-xl border transition-all cursor-pointer hover:bg-accent/50",
                    config.border,
                    powerUp.owned === 0 && "opacity-50"
                  )}
                  onClick={() => setSelectedPowerUp(powerUp)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shrink-0",
                      powerUp.color,
                      powerUp.owned === 0 && "grayscale"
                    )}>
                      <span className="text-white">{powerUp.icon}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-sm truncate">{powerUp.name}</h5>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {config.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {powerUp.effect}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {powerUp.duration}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {powerUp.owned > 0 ? (
                        <Badge variant="secondary" className="text-xs">
                          x{powerUp.owned}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          0
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Power-Up Detail Modal */}
        <AnimatePresence>
          {selectedPowerUp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedPowerUp(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-center mb-4">
                  <motion.div
                    className={cn(
                      "w-20 h-20 rounded-2xl mx-auto flex items-center justify-center bg-gradient-to-br mb-4",
                      selectedPowerUp.color
                    )}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <span className="text-white scale-150">{selectedPowerUp.icon}</span>
                  </motion.div>

                  <h3 className="text-xl font-bold">{selectedPowerUp.name}</h3>
                  <Badge variant="outline" className="mt-2">
                    {rarityConfig[selectedPowerUp.rarity].label}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground text-center mb-4">
                  {selectedPowerUp.description}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-500" />
                    <p className="text-sm font-bold">{selectedPowerUp.effect}</p>
                    <p className="text-[10px] text-muted-foreground">Efeito</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <Clock className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                    <p className="text-sm font-bold">{selectedPowerUp.duration}</p>
                    <p className="text-[10px] text-muted-foreground">Duração</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedPowerUp(null)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    className={cn(
                      "flex-1 bg-gradient-to-r",
                      selectedPowerUp.color
                    )}
                    disabled={selectedPowerUp.owned === 0}
                    onClick={() => handleActivate(selectedPowerUp)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Ativar
                  </Button>
                </div>

                {selectedPowerUp.owned === 0 && (
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    Você não possui este power-up
                  </p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button variant="outline" className="w-full">
          Loja de Power-Ups
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
});
