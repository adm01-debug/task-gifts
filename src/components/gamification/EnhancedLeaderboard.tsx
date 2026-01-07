import React, { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Crown, Medal, Star, TrendingUp, TrendingDown,
  Minus, Users, Building2, Globe, Filter, ChevronUp,
  ChevronDown, Flame, Zap, Award
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  id: string;
  rank: number;
  previousRank: number;
  name: string;
  avatar?: string;
  department: string;
  level: number;
  xp: number;
  weeklyXP: number;
  streak: number;
  badges: string[];
  isCurrentUser?: boolean;
}

const leaderboardData: LeaderboardEntry[] = [
  { id: "1", rank: 1, previousRank: 2, name: "Carlos Silva", department: "Tecnologia", level: 42, xp: 125000, weeklyXP: 2500, streak: 15, badges: ["🏆", "⚡", "🔥"] },
  { id: "2", rank: 2, previousRank: 1, name: "Ana Santos", department: "Marketing", level: 40, xp: 118000, weeklyXP: 2100, streak: 12, badges: ["🎯", "💡"] },
  { id: "3", rank: 3, previousRank: 3, name: "Pedro Lima", department: "Vendas", level: 38, xp: 105000, weeklyXP: 1800, streak: 8, badges: ["🤝", "⭐"] },
  { id: "4", rank: 4, previousRank: 6, name: "Maria Costa", department: "RH", level: 35, xp: 95000, weeklyXP: 2200, streak: 20, badges: ["🌟"], isCurrentUser: true },
  { id: "5", rank: 5, previousRank: 4, name: "João Oliveira", department: "Financeiro", level: 34, xp: 92000, weeklyXP: 1500, streak: 5, badges: ["📊"] },
  { id: "6", rank: 6, previousRank: 5, name: "Lucia Ferreira", department: "Operações", level: 33, xp: 88000, weeklyXP: 1400, streak: 7, badges: [] },
  { id: "7", rank: 7, previousRank: 8, name: "Roberto Alves", department: "Tecnologia", level: 32, xp: 85000, weeklyXP: 1600, streak: 10, badges: ["💻"] },
  { id: "8", rank: 8, previousRank: 7, name: "Fernanda Lima", department: "Marketing", level: 31, xp: 82000, weeklyXP: 1300, streak: 4, badges: [] },
];

const departmentLeaderboard = [
  { id: "1", rank: 1, name: "Tecnologia", memberCount: 45, totalXP: 450000, weeklyXP: 12000, avgLevel: 28 },
  { id: "2", rank: 2, name: "Marketing", memberCount: 32, totalXP: 380000, weeklyXP: 9500, avgLevel: 25 },
  { id: "3", rank: 3, name: "Vendas", memberCount: 28, totalXP: 320000, weeklyXP: 8800, avgLevel: 24 },
  { id: "4", rank: 4, name: "RH", memberCount: 15, totalXP: 180000, weeklyXP: 5200, avgLevel: 26 },
];

const RankBadge: React.FC<{ rank: number }> = memo(({ rank }) => {
  if (rank === 1) {
    return (
      <motion.div
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg"
      >
        <Crown className="h-5 w-5 text-white" />
      </motion.div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center">
        <Medal className="h-5 w-5 text-white" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
        <Award className="h-5 w-5 text-white" />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
      {rank}
    </div>
  );
});

RankBadge.displayName = "RankBadge";

const RankChange: React.FC<{ current: number; previous: number }> = memo(({ current, previous }) => {
  const diff = previous - current;
  
  if (diff > 0) {
    return (
      <motion.div
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-0.5 text-green-500 text-xs"
      >
        <ChevronUp className="h-3 w-3" />
        <span>{diff}</span>
      </motion.div>
    );
  }
  if (diff < 0) {
    return (
      <motion.div
        initial={{ y: -5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-0.5 text-red-500 text-xs"
      >
        <ChevronDown className="h-3 w-3" />
        <span>{Math.abs(diff)}</span>
      </motion.div>
    );
  }
  return <Minus className="h-3 w-3 text-muted-foreground" />;
});

RankChange.displayName = "RankChange";

const LeaderboardRow: React.FC<{ entry: LeaderboardEntry; index: number }> = memo(({ entry, index }) => {
  const isTop3 = entry.rank <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl transition-all",
        entry.isCurrentUser && "bg-primary/10 border-2 border-primary/30",
        isTop3 && !entry.isCurrentUser && "bg-gradient-to-r from-muted/50 to-transparent",
        !isTop3 && !entry.isCurrentUser && "hover:bg-muted/30"
      )}
    >
      {/* Rank */}
      <div className="flex items-center gap-2 w-16">
        <RankBadge rank={entry.rank} />
        <RankChange current={entry.rank} previous={entry.previousRank} />
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className={cn("h-10 w-10", isTop3 && "ring-2 ring-offset-2", entry.rank === 1 && "ring-yellow-500", entry.rank === 2 && "ring-gray-400", entry.rank === 3 && "ring-orange-500")}>
          <AvatarImage src={entry.avatar} />
          <AvatarFallback>{entry.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("font-semibold truncate", entry.isCurrentUser && "text-primary")}>
              {entry.name}
              {entry.isCurrentUser && <span className="text-xs ml-1">(você)</span>}
            </span>
            {entry.badges.length > 0 && (
              <span className="text-sm">{entry.badges.slice(0, 3).join("")}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{entry.department}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500" />
              Nível {entry.level}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="hidden md:flex items-center gap-6">
        <div className="text-center">
          <div className="font-bold">{entry.xp.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">XP Total</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-green-600">+{entry.weeklyXP.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Esta Semana</div>
        </div>
        {entry.streak > 0 && (
          <Badge className="bg-orange-500/20 text-orange-600">
            <Flame className="h-3 w-3 mr-1" />
            {entry.streak}
          </Badge>
        )}
      </div>
    </motion.div>
  );
});

LeaderboardRow.displayName = "LeaderboardRow";

const DepartmentRow: React.FC<{ dept: typeof departmentLeaderboard[0]; index: number }> = memo(({ dept, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/30 transition-colors"
    >
      <RankBadge rank={dept.rank} />
      
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <span className="font-semibold">{dept.name}</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{dept.memberCount} membros</span>
            <span>•</span>
            <span>Nível médio: {dept.avgLevel}</span>
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6">
        <div className="text-center">
          <div className="font-bold">{dept.totalXP.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">XP Total</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-green-600">+{dept.weeklyXP.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Esta Semana</div>
        </div>
      </div>
    </motion.div>
  );
});

DepartmentRow.displayName = "DepartmentRow";

export const EnhancedLeaderboard: React.FC<{ className?: string }> = memo(({ className }) => {
  const [period, setPeriod] = useState("weekly");
  const [scope, setScope] = useState("individual");

  const currentUserEntry = leaderboardData.find(e => e.isCurrentUser);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle>Ranking</CardTitle>
              <p className="text-sm text-muted-foreground">
                Compete e suba no ranking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Hoje</SelectItem>
                <SelectItem value="weekly">Semana</SelectItem>
                <SelectItem value="monthly">Mês</SelectItem>
                <SelectItem value="alltime">Geral</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Current User Position Highlight */}
        {currentUserEntry && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-xl bg-primary/20 border border-primary/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RankBadge rank={currentUserEntry.rank} />
                <div>
                  <span className="font-semibold">Sua Posição</span>
                  <div className="text-sm text-muted-foreground">
                    {currentUserEntry.rank - 1 > 0 
                      ? `${(leaderboardData[currentUserEntry.rank - 2]?.xp - currentUserEntry.xp).toLocaleString()} XP para subir`
                      : "Você está no topo!"}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{currentUserEntry.xp.toLocaleString()} XP</div>
                <RankChange current={currentUserEntry.rank} previous={currentUserEntry.previousRank} />
              </div>
            </div>
          </motion.div>
        )}
      </CardHeader>

      <Tabs value={scope} onValueChange={setScope}>
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Individual
            </TabsTrigger>
            <TabsTrigger value="department" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Departamentos
            </TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="p-4">
          <TabsContent value="individual" className="mt-0 space-y-2">
            {leaderboardData.map((entry, i) => (
              <LeaderboardRow key={entry.id} entry={entry} index={i} />
            ))}
          </TabsContent>

          <TabsContent value="department" className="mt-0 space-y-2">
            {departmentLeaderboard.map((dept, i) => (
              <DepartmentRow key={dept.id} dept={dept} index={i} />
            ))}
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
});

EnhancedLeaderboard.displayName = "EnhancedLeaderboard";
