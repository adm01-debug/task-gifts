import { motion } from "framer-motion";
import { Trophy, Crown, Medal, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface LeaderboardPlayer {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  trend: "up" | "down" | "same";
  department: string;
}

const players: LeaderboardPlayer[] = [
  { rank: 1, name: "Ana Silva", avatar: "AS", xp: 12450, level: 48, streak: 32, trend: "same", department: "Engineering" },
  { rank: 2, name: "Carlos M.", avatar: "CM", xp: 11200, level: 45, streak: 28, trend: "up", department: "Design" },
  { rank: 3, name: "Maria F.", avatar: "MF", xp: 10800, level: 44, streak: 21, trend: "up", department: "Product" },
  { rank: 4, name: "João Dev", avatar: "JD", xp: 9650, level: 42, streak: 12, trend: "down", department: "Engineering" },
  { rank: 5, name: "Laura T.", avatar: "LT", xp: 9200, level: 41, streak: 15, trend: "up", department: "Marketing" },
];

const podiumOrder = [1, 0, 2]; // Silver, Gold, Bronze positions

export const LiveLeaderboard = () => {
  const topThree = players.slice(0, 3);
  const restOfPlayers = players.slice(3);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-gold" />;
      case 2:
        return <Medal className="w-5 h-5 text-silver" />;
      case 3:
        return <Medal className="w-5 h-5 text-bronze" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-success" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card rounded-2xl border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-gold" />
          </div>
          <div>
            <h3 className="font-bold">Leaderboard</h3>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </div>
        </div>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          Live
        </motion.div>
      </div>

      {/* Podium */}
      <div className="px-4 py-6 border-b border-border bg-gradient-to-b from-muted/30 to-transparent">
        <div className="flex items-end justify-center gap-4">
          {podiumOrder.map((index, i) => {
            const player = topThree[index];
            const isFirst = index === 0;
            
            return (
              <motion.div
                key={player.rank}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.15 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-2">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`
                      w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold
                      ${isFirst ? "rank-gold" : index === 1 ? "rank-silver" : "rank-bronze"}
                    `}
                  >
                    {player.avatar}
                  </motion.div>
                  <div className="absolute -top-2 -right-2">
                    {getRankIcon(player.rank)}
                  </div>
                </div>
                <p className="font-semibold text-sm text-center">{player.name}</p>
                <p className="text-xs text-muted-foreground">{player.xp.toLocaleString()} XP</p>
                
                {/* Podium base */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: isFirst ? 60 : index === 1 ? 40 : 30 }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                  className={`
                    w-16 mt-2 rounded-t-lg
                    ${isFirst ? "bg-gradient-to-t from-gold/30 to-gold/10" : 
                      index === 1 ? "bg-gradient-to-t from-silver/30 to-silver/10" : 
                      "bg-gradient-to-t from-bronze/30 to-bronze/10"}
                  `}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Rest of players */}
      <div className="divide-y divide-border">
        {restOfPlayers.map((player, i) => (
          <motion.div
            key={player.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            whileHover={{ backgroundColor: "hsl(var(--muted) / 0.3)" }}
            className="flex items-center gap-3 p-3 transition-colors"
          >
            <span className="w-6 text-center font-bold text-muted-foreground">
              #{player.rank}
            </span>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary/30 to-accent/30 flex items-center justify-center font-semibold text-sm">
              {player.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{player.name}</p>
              <p className="text-xs text-muted-foreground">{player.department}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm text-xp">{player.xp.toLocaleString()}</p>
              <div className="flex items-center justify-end gap-1">
                {getTrendIcon(player.trend)}
                <span className="text-xs text-muted-foreground">Lv.{player.level}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View All */}
      <div className="p-3 border-t border-border">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2 rounded-lg bg-muted/50 hover:bg-muted text-sm font-medium transition-colors"
        >
          Ver ranking completo
        </motion.button>
      </div>
    </motion.div>
  );
};
