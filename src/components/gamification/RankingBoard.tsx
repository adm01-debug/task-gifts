import { memo, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, TrendingUp, TrendingDown, Minus, Users, Star, Flame, ChevronRight, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface RankingUser {
  id: string;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
  position: number;
  previousPosition: number;
  streak: number;
  department: string;
  isCurrentUser?: boolean;
}

const mockRankings: RankingUser[] = [
  { id: "1", name: "Ricardo Santos", xp: 15420, level: 25, position: 1, previousPosition: 1, streak: 45, department: "Tech" },
  { id: "2", name: "Ana Costa", xp: 14850, level: 24, position: 2, previousPosition: 4, streak: 32, department: "Design" },
  { id: "3", name: "Pedro Lima", xp: 14200, level: 23, position: 3, previousPosition: 2, streak: 28, department: "Tech" },
  { id: "4", name: "Julia Ferreira", xp: 13900, level: 22, position: 4, previousPosition: 3, streak: 21, department: "Marketing" },
  { id: "5", name: "Você", xp: 12500, level: 20, position: 5, previousPosition: 7, streak: 15, department: "Tech", isCurrentUser: true },
  { id: "6", name: "Carlos Mendes", xp: 12100, level: 19, position: 6, previousPosition: 5, streak: 18, department: "RH" },
  { id: "7", name: "Maria Silva", xp: 11800, level: 18, position: 7, previousPosition: 6, streak: 12, department: "Finance" },
  { id: "8", name: "Lucas Rocha", xp: 11500, level: 18, position: 8, previousPosition: 9, streak: 14, department: "Tech" },
];

const positionIcons: Record<number, React.ReactNode> = {
  1: <Crown className="h-5 w-5 text-amber-500" />,
  2: <Medal className="h-5 w-5 text-gray-400" />,
  3: <Medal className="h-5 w-5 text-amber-700" />,
};

const positionColors: Record<number, string> = {
  1: "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/50",
  2: "bg-gradient-to-r from-gray-400/20 to-gray-300/20 border-gray-400/50",
  3: "bg-gradient-to-r from-amber-700/20 to-orange-700/20 border-amber-700/50",
};

export const RankingBoard = memo(function RankingBoard() {
  const [period, setPeriod] = useState<"weekly" | "monthly" | "alltime">("weekly");
  const currentUser = mockRankings.find(u => u.isCurrentUser);

  const getTrend = (current: number, previous: number) => {
    if (current < previous) return { icon: TrendingUp, color: "text-green-500", diff: previous - current };
    if (current > previous) return { icon: TrendingDown, color: "text-red-500", diff: current - previous };
    return { icon: Minus, color: "text-muted-foreground", diff: 0 };
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <span>Ranking Global</span>
          </div>
          <Button variant="ghost" size="sm" className="gap-1">
            <Filter className="h-4 w-4" />
            Filtrar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly">Semanal</TabsTrigger>
            <TabsTrigger value="monthly">Mensal</TabsTrigger>
            <TabsTrigger value="alltime">Geral</TabsTrigger>
          </TabsList>

          <TabsContent value={period} className="mt-4 space-y-2">
            {/* Top 3 Podium */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[mockRankings[1], mockRankings[0], mockRankings[2]].map((user, idx) => {
                const podiumOrder = [2, 1, 3][idx];
                const heights = ["h-16", "h-20", "h-14"];
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <Avatar className={cn("border-2", podiumOrder === 1 ? "h-14 w-14 border-amber-500" : "h-10 w-10 border-muted")}>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="text-xs font-medium mt-1 truncate max-w-full">{user.name.split(" ")[0]}</p>
                    <p className="text-[10px] text-muted-foreground">{user.xp.toLocaleString()} XP</p>
                    <div className={cn("w-full rounded-t-lg mt-1 flex items-end justify-center", heights[idx])}>
                      <div className={cn(
                        "w-full rounded-t-lg flex items-center justify-center",
                        heights[idx],
                        podiumOrder === 1 ? "bg-gradient-to-t from-amber-600 to-amber-400" :
                        podiumOrder === 2 ? "bg-gradient-to-t from-gray-500 to-gray-300" :
                        "bg-gradient-to-t from-amber-800 to-amber-600"
                      )}>
                        <span className="text-white font-bold text-lg">{podiumOrder}º</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Rankings List */}
            <div className="space-y-2">
              {mockRankings.slice(3).map((user, index) => {
                const trend = getTrend(user.position, user.previousPosition);
                const TrendIcon = trend.icon;
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all",
                      user.isCurrentUser && "bg-primary/5 border-primary/30"
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold text-sm">
                      {user.position}
                    </div>
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">
                          {user.name}
                          {user.isCurrentUser && <Badge variant="secondary" className="ml-2 text-[10px]">Você</Badge>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Nível {user.level}</span>
                        <span>•</span>
                        <span>{user.department}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{user.xp.toLocaleString()}</p>
                      <div className={cn("flex items-center gap-1 text-xs", trend.color)}>
                        <TrendIcon className="h-3 w-3" />
                        {trend.diff > 0 && <span>{trend.diff}</span>}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Current User Position (if not in top) */}
            {currentUser && currentUser.position > 8 && (
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">Sua posição</p>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/30">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center font-bold text-sm">
                    {currentUser.position}
                  </div>
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>V</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Você</p>
                    <p className="text-xs text-muted-foreground">Nível {currentUser.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{currentUser.xp.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t">
          <div className="text-center">
            <Users className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-lg font-bold">1.2K</p>
            <p className="text-[10px] text-muted-foreground">Participantes</p>
          </div>
          <div className="text-center">
            <Star className="h-4 w-4 mx-auto text-amber-500 mb-1" />
            <p className="text-lg font-bold">5º</p>
            <p className="text-[10px] text-muted-foreground">Sua Posição</p>
          </div>
          <div className="text-center">
            <Flame className="h-4 w-4 mx-auto text-orange-500 mb-1" />
            <p className="text-lg font-bold">+2</p>
            <p className="text-[10px] text-muted-foreground">Subiu</p>
          </div>
        </div>

        <Button variant="outline" className="w-full gap-2">
          Ver Ranking Completo
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
});
