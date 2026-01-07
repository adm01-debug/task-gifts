import { memo, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Trophy, Medal, Crown, Star, TrendingUp, 
  TrendingDown, Minus, ChevronUp, ChevronDown,
  Flame, Zap, Users, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  id: string;
  rank: number;
  previousRank: number;
  user: {
    name: string;
    avatar?: string;
    department: string;
    level: number;
  };
  score: number;
  streak: number;
  achievements: number;
  trend: "up" | "down" | "stable";
  isCurrentUser?: boolean;
}

const mockLeaderboard: LeaderboardEntry[] = [
  { id: "1", rank: 1, previousRank: 2, user: { name: "Ana Costa", department: "Produto", level: 28 }, score: 12450, streak: 15, achievements: 42, trend: "up" },
  { id: "2", rank: 2, previousRank: 1, user: { name: "Carlos Silva", department: "Tech", level: 26 }, score: 11890, streak: 12, achievements: 38, trend: "down" },
  { id: "3", rank: 3, previousRank: 3, user: { name: "Maria Santos", department: "RH", level: 25 }, score: 11200, streak: 20, achievements: 35, trend: "stable" },
  { id: "4", rank: 4, previousRank: 6, user: { name: "João Pedro", department: "Marketing", level: 23 }, score: 10800, streak: 8, achievements: 30, trend: "up" },
  { id: "5", rank: 5, previousRank: 4, user: { name: "Lucia Ferreira", department: "Vendas", level: 22 }, score: 10500, streak: 5, achievements: 28, trend: "down" },
  { id: "6", rank: 6, previousRank: 5, user: { name: "Pedro Alves", department: "Tech", level: 21 }, score: 10200, streak: 10, achievements: 25, trend: "down" },
  { id: "7", rank: 7, previousRank: 8, user: { name: "Você", department: "Produto", level: 18 }, score: 8500, streak: 7, achievements: 20, trend: "up", isCurrentUser: true },
  { id: "8", rank: 8, previousRank: 7, user: { name: "Fernanda Lima", department: "Design", level: 19 }, score: 8200, streak: 4, achievements: 22, trend: "down" },
];

const RankBadge = memo(function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg"
      >
        <Crown className="w-5 h-5 text-white" />
      </motion.div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center">
        <Medal className="w-5 h-5 text-white" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center">
        <Medal className="w-5 h-5 text-white" />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
      <span className="font-bold text-muted-foreground">{rank}</span>
    </div>
  );
});

const LeaderboardRow = memo(function LeaderboardRow({ 
  entry,
  maxScore
}: { 
  entry: LeaderboardEntry;
  maxScore: number;
}) {
  const rankChange = entry.previousRank - entry.rank;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "p-3 rounded-xl border transition-all",
        entry.isCurrentUser && "ring-2 ring-primary bg-primary/5",
        entry.rank <= 3 && "bg-gradient-to-r from-muted/50 to-transparent"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Rank Badge */}
        <RankBadge rank={entry.rank} />

        {/* User Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className={cn(
            "w-10 h-10 border-2",
            entry.rank === 1 && "border-yellow-500",
            entry.rank === 2 && "border-slate-400",
            entry.rank === 3 && "border-amber-600",
            entry.rank > 3 && "border-border"
          )}>
            <AvatarImage src={entry.user.avatar} />
            <AvatarFallback>{entry.user.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className={cn(
                "font-semibold text-sm truncate",
                entry.isCurrentUser && "text-primary"
              )}>
                {entry.user.name}
                {entry.isCurrentUser && " (Você)"}
              </h4>
              <Badge variant="outline" className="text-[10px] h-4 shrink-0">
                Lv.{entry.user.level}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{entry.user.department}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="text-center">
            <div className="flex items-center gap-1 text-xs">
              <Flame className="w-3 h-3 text-orange-500" />
              <span className="font-medium">{entry.streak}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Streak</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 text-xs">
              <Trophy className="w-3 h-3 text-yellow-500" />
              <span className="font-medium">{entry.achievements}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Conquistas</p>
          </div>
        </div>

        {/* Score & Trend */}
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            <span className="font-bold text-lg">{entry.score.toLocaleString()}</span>
            {rankChange !== 0 && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-[10px] h-5",
                  rankChange > 0 && "bg-green-500/20 text-green-500",
                  rankChange < 0 && "bg-red-500/20 text-red-500"
                )}
              >
                {rankChange > 0 ? (
                  <><ChevronUp className="w-3 h-3" />{rankChange}</>
                ) : (
                  <><ChevronDown className="w-3 h-3" />{Math.abs(rankChange)}</>
                )}
              </Badge>
            )}
          </div>
          <div className="w-24 mt-1">
            <Progress value={(entry.score / maxScore) * 100} className="h-1" />
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export const GlobalLeaderboard = memo(function GlobalLeaderboard({ 
  className 
}: { 
  className?: string;
}) {
  const [leaderboard] = useState(mockLeaderboard);
  const [filter, setFilter] = useState<"all" | "weekly" | "monthly">("weekly");

  const maxScore = useMemo(() => 
    Math.max(...leaderboard.map(e => e.score)),
    [leaderboard]
  );

  const currentUserEntry = useMemo(() => 
    leaderboard.find(e => e.isCurrentUser),
    [leaderboard]
  );

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Ranking Global</CardTitle>
              <p className="text-xs text-muted-foreground">
                {leaderboard.length} participantes
              </p>
            </div>
          </div>

          <div className="flex gap-1">
            {(["all", "weekly", "monthly"] as const).map(f => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "ghost"}
                className="h-7 text-xs"
                onClick={() => setFilter(f)}
              >
                {f === "all" && "Geral"}
                {f === "weekly" && "Semanal"}
                {f === "monthly" && "Mensal"}
              </Button>
            ))}
          </div>
        </div>

        {/* Current User Position */}
        {currentUserEntry && (
          <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-bold text-primary">{currentUserEntry.rank}º</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Sua posição</p>
                  <p className="text-xs text-muted-foreground">
                    {currentUserEntry.rank <= 3 ? "Top 3! 🎉" : `Faltam ${leaderboard[currentUserEntry.rank - 2]?.score - currentUserEntry.score} pts para subir`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-primary">{currentUserEntry.score.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">pontos</p>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-2">
        <AnimatePresence>
          {leaderboard.map(entry => (
            <LeaderboardRow 
              key={entry.id} 
              entry={entry}
              maxScore={maxScore}
            />
          ))}
        </AnimatePresence>

        <Button variant="outline" className="w-full mt-4">
          <Users className="w-4 h-4 mr-2" />
          Ver ranking completo
        </Button>
      </CardContent>
    </Card>
  );
});

export default GlobalLeaderboard;
