import { useEffect, useRef, useMemo, useCallback, memo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLeagues } from "@/hooks/useLeagues";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { Trophy, TrendingUp, TrendingDown, Minus, Crown, Zap } from "lucide-react";

interface LeaderboardUser {
  user_id: string;
  weekly_xp: number;
  profile?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export const LeagueCard = memo(function LeagueCard() {
  const { leagues, myLeague, leaderboard, isLoading } = useLeagues();
  const { playAchievementSound, playLevelUpSound } = useSoundEffects();
  const previousPositionRef = useRef<number | null>(null);

  // All hooks MUST be called before any conditional returns (Rules of Hooks)
  const currentLeague = useMemo(() => {
    if (!myLeague) return null;
    return leagues.find(l => l.id === myLeague.league_id);
  }, [leagues, myLeague]);
  
  const userPosition = useMemo(() => {
    if (!myLeague) return 0;
    return leaderboard.findIndex(u => u.user_id === myLeague.user_id) + 1;
  }, [leaderboard, myLeague]);
  
  const promotionZone = currentLeague?.promotion_slots || 3;
  const demotionZone = leaderboard.length - (currentLeague?.demotion_slots || 3);

  const getPositionStyle = useCallback((position: number) => {
    if (position <= promotionZone) return "text-green-500 bg-green-500/10";
    if (position > demotionZone) return "text-red-500 bg-red-500/10";
    return "text-muted-foreground bg-muted";
  }, [promotionZone, demotionZone]);

  const getPositionIcon = useCallback((position: number) => {
    if (position === 1) return <Crown className="h-4 w-4 text-amber-500" />;
    if (position <= promotionZone) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (position > demotionZone) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  }, [promotionZone, demotionZone]);

  // Detectar mudanças de posição e tocar sons
  useEffect(() => {
    if (!myLeague || leaderboard.length === 0) return;
    
    const currentPosition = leaderboard.findIndex(u => u.user_id === myLeague.user_id) + 1;
    
    if (previousPositionRef.current !== null && currentPosition > 0) {
      const previousPosition = previousPositionRef.current;
      const currentLeagueData = leagues.find(l => l.id === myLeague.league_id);
      const promotionSlots = currentLeagueData?.promotion_slots || 3;
      
      // Subiu de posição
      if (currentPosition < previousPosition) {
        // Entrou na zona de promoção
        if (currentPosition <= promotionSlots && previousPosition > promotionSlots) {
          playLevelUpSound();
        } else {
          playAchievementSound();
        }
      }
      // Chegou ao primeiro lugar
      if (currentPosition === 1 && previousPosition !== 1) {
        playLevelUpSound();
      }
    }
    
    previousPositionRef.current = currentPosition;
  }, [leaderboard, myLeague, leagues, playAchievementSound, playLevelUpSound]);

  // Conditional renders AFTER all hooks
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Carregando ligas...
        </CardContent>
      </Card>
    );
  }

  if (!myLeague) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Você ainda não está em uma liga</p>
          <p className="text-sm text-muted-foreground mt-1">
            Complete atividades para entrar na competição!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">{currentLeague?.icon}</span>
            Liga {currentLeague?.name}
          </CardTitle>
          <Badge 
            variant="outline" 
            style={{ borderColor: currentLeague?.color, color: currentLeague?.color }}
          >
            +{currentLeague?.xp_bonus_percent}% XP
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Sua posição</span>
          <div className="flex items-center gap-2">
            {getPositionIcon(userPosition)}
            <span className="font-bold text-lg">#{userPosition}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Zap className="h-4 w-4 text-amber-500" />
          <span>XP semanal:</span>
          <span className="font-semibold">{myLeague.weekly_xp.toLocaleString()}</span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="text-green-500">Promoção (Top {promotionZone})</span>
            <span className="text-red-500">Rebaixamento (Últimos {currentLeague?.demotion_slots})</span>
          </div>
        <div className="h-2 rounded-full bg-gradient-to-r from-green-500/20 via-muted to-red-500/20">
            <motion.div
              className="h-full w-2 bg-primary rounded-full"
              initial={{ marginLeft: "0%" }}
              animate={{ 
                marginLeft: `${leaderboard.length > 0 ? Math.min(100, ((userPosition - 1) / leaderboard.length) * 100) : 0}%` 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {leaderboard.slice(0, 10).map((user, index) => {
              const position = index + 1;
              const isCurrentUser = user.user_id === myLeague.user_id;
              const typedUser = user as LeaderboardUser;

              return (
                <motion.div
                  key={user.user_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    isCurrentUser ? 'bg-primary/10 ring-1 ring-primary/30' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    getPositionStyle(position)
                  }`}>
                    {position}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={typedUser.profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      {typedUser.profile?.display_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className={`flex-1 truncate ${isCurrentUser ? 'font-semibold' : ''}`}>
                    {typedUser.profile?.display_name || 'Usuário'}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {user.weekly_xp.toLocaleString()} XP
                  </span>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="text-xs text-center text-muted-foreground pt-2 border-t">
          Rankings atualizam toda segunda-feira
        </div>
      </CardContent>
    </Card>
  );
});
