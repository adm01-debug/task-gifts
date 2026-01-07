import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, Gem, ArrowUpRight, ArrowDownLeft, TrendingUp, 
  ShoppingBag, Gift, History, ChevronRight, Sparkles, 
  Zap, Crown, Star, Timer, RefreshCw, Eye, EyeOff,
  ArrowUp, ArrowDown, Coins, Trophy
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: "earned" | "spent" | "bonus" | "transfer";
  amount: number;
  description: string;
  date: string;
  source: string;
  icon?: string;
}

interface PowerUp {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: React.ElementType;
  duration: string;
  active: boolean;
}

const mockTransactions: Transaction[] = [
  { id: "1", type: "earned", amount: 150, description: "Tarefa completada", date: "Hoje, 14:32", source: "Quest", icon: "🎯" },
  { id: "2", type: "spent", amount: -500, description: "Power-Up 2x XP", date: "Hoje, 10:15", source: "Loja", icon: "⚡" },
  { id: "3", type: "bonus", amount: 200, description: "Bônus de streak", date: "Ontem, 18:00", source: "Sistema", icon: "🔥" },
  { id: "4", type: "transfer", amount: 75, description: "Presente de @maria", date: "Ontem, 15:30", source: "Social", icon: "🎁" },
  { id: "5", type: "earned", amount: 100, description: "Check-in diário", date: "Ontem, 09:00", source: "Login", icon: "✅" },
  { id: "6", type: "bonus", amount: 500, description: "Conquista desbloqueada", date: "2 dias atrás", source: "Achievement", icon: "🏆" },
];

const mockPowerUps: PowerUp[] = [
  { id: "1", name: "2x XP Boost", description: "Dobra seu XP por 1 hora", cost: 500, icon: Zap, duration: "1h", active: false },
  { id: "2", name: "Escudo de Streak", description: "Protege seu streak por 1 dia", cost: 300, icon: Crown, duration: "24h", active: true },
  { id: "3", name: "Multiplicador", description: "1.5x em todas moedas", cost: 750, icon: Star, duration: "2h", active: false },
];

const typeConfig = {
  earned: { icon: ArrowDownLeft, color: "text-green-500", bg: "bg-green-500/10", label: "Ganho" },
  spent: { icon: ArrowUpRight, color: "text-red-500", bg: "bg-red-500/10", label: "Gasto" },
  bonus: { icon: Sparkles, color: "text-amber-500", bg: "bg-amber-500/10", label: "Bônus" },
  transfer: { icon: Gift, color: "text-purple-500", bg: "bg-purple-500/10", label: "Transferência" },
};

export const CoinWallet = memo(function CoinWallet() {
  const [balance, setBalance] = useState(2450);
  const [weeklyEarned] = useState(875);
  const [weeklySpent] = useState(500);
  const [hideBalance, setHideBalance] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"transactions" | "powerups">("transactions");
  const [animatingCoins, setAnimatingCoins] = useState(false);
  const [dailyBonus, setDailyBonus] = useState({ available: true, amount: 50, nextIn: "18:32:45" });

  // Animação de moedas caindo
  const triggerCoinAnimation = () => {
    setAnimatingCoins(true);
    setTimeout(() => setAnimatingCoins(false), 2000);
  };

  const claimDailyBonus = () => {
    if (dailyBonus.available) {
      triggerCoinAnimation();
      setBalance(prev => prev + dailyBonus.amount);
      setDailyBonus(prev => ({ ...prev, available: false }));
    }
  };

  const netChange = weeklyEarned - weeklySpent;
  const netPositive = netChange >= 0;

  return (
    <Card className="overflow-hidden relative">
      {/* Coin Rain Animation */}
      <AnimatePresence>
        {animatingCoins && (
          <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, x: Math.random() * 100 + "%", opacity: 1, rotate: 0 }}
                animate={{ y: "100%", rotate: 360 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 + Math.random(), delay: Math.random() * 0.5 }}
                className="absolute"
              >
                <Coins className="h-6 w-6 text-amber-400" />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 flex items-center justify-center shadow-lg"
            >
              <Wallet className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <span className="font-bold">Carteira</span>
              <p className="text-xs text-muted-foreground font-normal">Suas moedas e recompensas</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => setHideBalance(!hideBalance)}>
              {hideBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon">
              <History className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Premium Balance Display */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative p-5 rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 text-white overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 right-2 w-32 h-32 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-2 left-2 w-24 h-24 bg-white rounded-full blur-2xl" />
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm opacity-90">Saldo Atual</p>
              <Badge className="bg-white/20 text-white border-0 text-xs">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            </div>
            
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Gem className="h-10 w-10" />
              </motion.div>
              <motion.span 
                className="text-5xl font-bold"
                key={balance}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                {hideBalance ? "•••••" : balance.toLocaleString()}
              </motion.span>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-sm opacity-80">moedas disponíveis</p>
              <div className={cn(
                "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
                netPositive ? "bg-green-500/30" : "bg-red-500/30"
              )}>
                {netPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {netPositive ? "+" : ""}{netChange} esta semana
              </div>
            </div>
          </div>
        </motion.div>

        {/* Daily Bonus */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={cn(
            "p-3 rounded-xl border-2 border-dashed transition-colors cursor-pointer",
            dailyBonus.available 
              ? "border-amber-500/50 bg-amber-500/5 hover:bg-amber-500/10" 
              : "border-muted bg-muted/30"
          )}
          onClick={claimDailyBonus}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                dailyBonus.available ? "bg-amber-500/20" : "bg-muted"
              )}>
                {dailyBonus.available ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Gift className="h-5 w-5 text-amber-500" />
                  </motion.div>
                ) : (
                  <Timer className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {dailyBonus.available ? "Bônus Diário Disponível!" : "Próximo Bônus"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {dailyBonus.available ? `+${dailyBonus.amount} moedas` : `em ${dailyBonus.nextIn}`}
                </p>
              </div>
            </div>
            {dailyBonus.available && (
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600">
                Coletar
              </Button>
            )}
          </div>
        </motion.div>

        {/* Weekly Stats */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div 
            whileHover={{ y: -2 }}
            className="p-3 rounded-xl bg-green-500/10 border border-green-500/20"
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Ganhos (semana)</span>
            </div>
            <p className="text-xl font-bold text-green-500">+{weeklyEarned}</p>
            <Progress value={75} className="h-1 mt-2" />
          </motion.div>
          <motion.div 
            whileHover={{ y: -2 }}
            className="p-3 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="h-4 w-4 text-red-500" />
              <span className="text-xs text-muted-foreground">Gastos (semana)</span>
            </div>
            <p className="text-xl font-bold text-red-500">-{weeklySpent}</p>
            <Progress value={45} className="h-1 mt-2" />
          </motion.div>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {[
            { id: "transactions", label: "Transações", icon: History },
            { id: "powerups", label: "Power-Ups", icon: Zap },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={selectedTab === tab.id ? "default" : "ghost"}
              size="sm"
              className="flex-1 gap-2"
              onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {selectedTab === "transactions" ? (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-2 max-h-56 overflow-y-auto"
            >
              {mockTransactions.map((tx, index) => {
                const config = typeConfig[tx.type];
                const Icon = config.icon;
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4, backgroundColor: "hsl(var(--muted) / 0.5)" }}
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg", config.bg)}>
                      {tx.icon || <Icon className={cn("h-5 w-5", config.color)} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.description}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                        <Badge variant="outline" className="text-[10px] h-4">{tx.source}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("font-bold", config.color)}>
                        {tx.amount > 0 ? "+" : ""}{tx.amount}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="powerups"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-2"
            >
              {mockPowerUps.map((powerup, index) => (
                <motion.div
                  key={powerup.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all",
                    powerup.active 
                      ? "border-amber-500/50 bg-amber-500/5" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    powerup.active ? "bg-amber-500/20" : "bg-muted"
                  )}>
                    <powerup.icon className={cn(
                      "h-6 w-6",
                      powerup.active ? "text-amber-500" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{powerup.name}</p>
                      {powerup.active && (
                        <Badge className="bg-amber-500/20 text-amber-600 border-0 text-[10px]">
                          Ativo
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{powerup.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">Duração: {powerup.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-500 flex items-center gap-1">
                      <Gem className="h-4 w-4" />
                      {powerup.cost}
                    </p>
                    <Button 
                      size="sm" 
                      variant={powerup.active ? "outline" : "default"}
                      className="mt-1 h-7 text-xs"
                      disabled={powerup.active}
                    >
                      {powerup.active ? "Em uso" : "Comprar"}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="gap-2 h-12 hover:bg-primary/5">
            <ShoppingBag className="h-4 w-4" />
            Loja
          </Button>
          <Button variant="outline" className="gap-2 h-12 hover:bg-primary/5">
            <Gift className="h-4 w-4" />
            Enviar
          </Button>
        </div>

        <Button variant="outline" className="w-full gap-2">
          Ver Histórico Completo
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
});