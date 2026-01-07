import { memo } from "react";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Zap,
  Medal,
  Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
  position: number;
  previousPosition: number;
  isCurrentUser?: boolean;
  department?: string;
}

interface LeaderboardMiniProps {
  className?: string;
  title?: string;
  period?: "daily" | "weekly" | "monthly" | "allTime";
}

const mockLeaderboard: LeaderboardEntry[] = [
  { id: "1", name: "Maria Santos", avatar: "/avatars/maria.jpg", xp: 15420, level: 24, position: 1, previousPosition: 1, department: "Vendas" },
  { id: "2", name: "João Silva", avatar: "/avatars/joao.jpg", xp: 14850, level: 23, position: 2, previousPosition: 3, department: "Marketing" },
  { id: "3", name: "Ana Costa", avatar: "/avatars/ana.jpg", xp: 14200, level: 22, position: 3, previousPosition: 2, department: "TI" },
  { id: "4", name: "Você", xp: 12500, level: 20, position: 4, previousPosition: 6, isCurrentUser: true, department: "TI" },
  { id: "5", name: "Pedro Lima", avatar: "/avatars/pedro.jpg", xp: 11800, level: 19, position: 5, previousPosition: 4, department: "RH" },
];

const positionColors = {
  1: "from-yellow-400 to-amber-500",
  2: "from-gray-300 to-gray-400",
  3: "from-amber-600 to-orange-700",
};

const periodLabels = {
  daily: "Hoje",
  weekly: "Esta Semana",
  monthly: "Este Mês",
  allTime: "Geral",
};

export const LeaderboardMini = memo(function LeaderboardMini({
  className,
  title = "Ranking",
  period = "weekly",
}: LeaderboardMiniProps) {
  const currentUserEntry = mockLeaderboard.find(e => e.isCurrentUser);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <span>{title}</span>
              <p className="text-xs font-normal text-muted-foreground">
                {periodLabels[period]}
              </p>
            </div>
          </div>
          {currentUserEntry && (
            <Badge variant="secondary" className="gap-1">
              <Medal className="h-3 w-3" />
              #{currentUserEntry.position}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Top 3 Podium */}
        <div className="flex items-end justify-center gap-2 pb-3 border-b">
          {/* 2nd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center"
          >
            <Avatar className="w-12 h-12 border-2 border-gray-400">
              <AvatarImage src={mockLeaderboard[1].avatar} />
              <AvatarFallback>{mockLeaderboard[1].name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="w-10 h-12 bg-gradient-to-t from-gray-300 to-gray-400 rounded-t-lg mt-2 flex items-center justify-center">
              <span className="text-white font-bold text-lg">2</span>
            </div>
            <p className="text-[10px] font-medium mt-1 truncate max-w-[60px]">
              {mockLeaderboard[1].name.split(" ")[0]}
            </p>
          </motion.div>

          {/* 1st Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center -mt-4"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Crown className="h-6 w-6 text-yellow-500 mb-1" />
            </motion.div>
            <Avatar className="w-14 h-14 border-2 border-yellow-500 ring-2 ring-yellow-500/30">
              <AvatarImage src={mockLeaderboard[0].avatar} />
              <AvatarFallback>{mockLeaderboard[0].name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="w-12 h-16 bg-gradient-to-t from-yellow-400 to-amber-500 rounded-t-lg mt-2 flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <span className="text-white font-bold text-xl">1</span>
            </div>
            <p className="text-xs font-medium mt-1 truncate max-w-[70px]">
              {mockLeaderboard[0].name.split(" ")[0]}
            </p>
          </motion.div>

          {/* 3rd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <Avatar className="w-11 h-11 border-2 border-amber-600">
              <AvatarImage src={mockLeaderboard[2].avatar} />
              <AvatarFallback>{mockLeaderboard[2].name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="w-9 h-10 bg-gradient-to-t from-amber-600 to-orange-700 rounded-t-lg mt-2 flex items-center justify-center">
              <span className="text-white font-bold">3</span>
            </div>
            <p className="text-[10px] font-medium mt-1 truncate max-w-[55px]">
              {mockLeaderboard[2].name.split(" ")[0]}
            </p>
          </motion.div>
        </div>

        {/* Rest of Leaderboard */}
        <div className="space-y-2">
          {mockLeaderboard.slice(3).map((entry, index) => {
            const positionChange = entry.previousPosition - entry.position;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-all",
                  entry.isCurrentUser 
                    ? "bg-primary/10 border border-primary/30" 
                    : "hover:bg-muted/50"
                )}
              >
                {/* Position */}
                <div className="w-8 text-center">
                  <span className={cn(
                    "font-bold",
                    entry.isCurrentUser && "text-primary"
                  )}>
                    {entry.position}
                  </span>
                </div>

                {/* Position Change */}
                <div className="w-5">
                  {positionChange > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : positionChange < 0 ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : (
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                {/* Avatar & Name */}
                <Avatar className={cn(
                  "w-8 h-8",
                  entry.isCurrentUser && "ring-2 ring-primary"
                )}>
                  <AvatarImage src={entry.avatar} />
                  <AvatarFallback className="text-xs">
                    {entry.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    entry.isCurrentUser && "text-primary"
                  )}>
                    {entry.name}
                    {entry.isCurrentUser && (
                      <Badge variant="secondary" className="ml-2 text-[8px]">Você</Badge>
                    )}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Nv. {entry.level} • {entry.department}
                  </p>
                </div>

                {/* XP */}
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Zap className="h-3.5 w-3.5 text-yellow-500" />
                    {entry.xp.toLocaleString()}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Your Position Highlight */}
        {currentUserEntry && currentUserEntry.position > 5 && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Sua posição</span>
              </div>
              <Badge variant="outline" className="text-primary">
                #{currentUserEntry.position}
              </Badge>
            </div>
          </div>
        )}

        <Button variant="outline" className="w-full">
          Ver Ranking Completo
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
});
