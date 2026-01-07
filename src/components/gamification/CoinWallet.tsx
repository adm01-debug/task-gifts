import { memo, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Gem, ArrowUpRight, ArrowDownLeft, TrendingUp, ShoppingBag, Gift, History, ChevronRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: "earned" | "spent" | "bonus";
  amount: number;
  description: string;
  date: string;
  source: string;
}

const mockTransactions: Transaction[] = [
  { id: "1", type: "earned", amount: 150, description: "Tarefa completada", date: "Hoje, 14:32", source: "Quest" },
  { id: "2", type: "spent", amount: -500, description: "Power-Up 2x XP", date: "Hoje, 10:15", source: "Loja" },
  { id: "3", type: "bonus", amount: 200, description: "Bônus de streak", date: "Ontem, 18:00", source: "Sistema" },
  { id: "4", type: "earned", amount: 75, description: "Ajudou colega", date: "Ontem, 15:30", source: "Social" },
  { id: "5", type: "earned", amount: 100, description: "Check-in diário", date: "Ontem, 09:00", source: "Login" },
];

const typeConfig = {
  earned: { icon: ArrowDownLeft, color: "text-green-500", bg: "bg-green-500/10" },
  spent: { icon: ArrowUpRight, color: "text-red-500", bg: "bg-red-500/10" },
  bonus: { icon: Sparkles, color: "text-amber-500", bg: "bg-amber-500/10" },
};

export const CoinWallet = memo(function CoinWallet() {
  const [balance] = useState(2450);
  const [weeklyEarned] = useState(875);
  const [weeklySpent] = useState(500);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span>Carteira</span>
          </div>
          <Button variant="ghost" size="sm" className="gap-1">
            <History className="h-4 w-4" />
            Histórico
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance Display */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white"
        >
          <p className="text-sm opacity-80 mb-1">Saldo Atual</p>
          <div className="flex items-center gap-2">
            <Gem className="h-8 w-8" />
            <span className="text-4xl font-bold">{balance.toLocaleString()}</span>
          </div>
          <p className="text-sm opacity-80 mt-2">moedas disponíveis</p>
        </motion.div>

        {/* Weekly Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Ganhos (semana)</span>
            </div>
            <p className="text-xl font-bold text-green-500">+{weeklyEarned}</p>
          </div>
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="h-4 w-4 text-red-500" />
              <span className="text-xs text-muted-foreground">Gastos (semana)</span>
            </div>
            <p className="text-xl font-bold text-red-500">-{weeklySpent}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="gap-2 h-12">
            <ShoppingBag className="h-4 w-4" />
            Loja
          </Button>
          <Button variant="outline" className="gap-2 h-12">
            <Gift className="h-4 w-4" />
            Enviar
          </Button>
        </div>

        {/* Recent Transactions */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center justify-between">
            Transações Recentes
            <Badge variant="secondary">{mockTransactions.length}</Badge>
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {mockTransactions.map((tx, index) => {
              const config = typeConfig[tx.type];
              const Icon = config.icon;
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", config.bg)}>
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn("font-semibold", config.color)}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount}
                    </p>
                    <Badge variant="outline" className="text-[10px]">{tx.source}</Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <Button variant="outline" className="w-full gap-2">
          Ver Todas as Transações
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
});
