import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Trophy, Medal, Crown, Star, Zap, Gift, ShoppingBag,
  TrendingUp, Users, Flame, Target, Award, Sparkles,
  ChevronUp, ChevronDown, Minus, Lock, Check
} from "lucide-react";

interface LeagueInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  min_xp: number;
  max_xp: number;
  perks: string[];
}

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
  league: string;
  change: "up" | "down" | "same";
  streak: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xp_reward: number;
  coin_reward: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlocked: boolean;
  unlocked_at?: string;
  progress?: number;
  max_progress?: number;
}

interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price_coins: number;
  image?: string;
  stock?: number;
  is_available: boolean;
}

const LEAGUES: LeagueInfo[] = [
  { id: "bronze", name: "Bronze", icon: "🥉", color: "text-amber-600", min_xp: 0, max_xp: 999, perks: ["Acesso básico"] },
  { id: "silver", name: "Prata", icon: "🥈", color: "text-gray-400", min_xp: 1000, max_xp: 2999, perks: ["Badge exclusivo", "+5% XP bônus"] },
  { id: "gold", name: "Ouro", icon: "🥇", color: "text-yellow-500", min_xp: 3000, max_xp: 5999, perks: ["Badge exclusivo", "+10% XP bônus", "Prioridade suporte"] },
  { id: "platinum", name: "Platina", icon: "💎", color: "text-cyan-400", min_xp: 6000, max_xp: 9999, perks: ["Badge exclusivo", "+15% XP bônus", "Acesso antecipado"] },
  { id: "diamond", name: "Diamante", icon: "👑", color: "text-purple-500", min_xp: 10000, max_xp: Infinity, perks: ["Badge lendário", "+20% XP bônus", "Mentor exclusivo"] },
];

export const GamificationFullPanel = () => {
  const [userStats] = useState({
    xp: 4250,
    coins: 1580,
    level: 12,
    streak: 15,
    league: "gold",
    rank: 8,
    totalUsers: 150,
  });

  const [leaderboard] = useState<LeaderboardEntry[]>([
    { rank: 1, user_id: "1", name: "Maria Silva", xp: 8750, level: 18, league: "platinum", change: "same", streak: 45 },
    { rank: 2, user_id: "2", name: "João Santos", xp: 7200, level: 16, league: "platinum", change: "up", streak: 32 },
    { rank: 3, user_id: "3", name: "Ana Costa", xp: 6800, level: 15, league: "platinum", change: "down", streak: 28 },
    { rank: 4, user_id: "4", name: "Pedro Lima", xp: 5500, level: 14, league: "gold", change: "up", streak: 21 },
    { rank: 5, user_id: "5", name: "Carlos Dias", xp: 5200, level: 13, league: "gold", change: "same", streak: 18 },
    { rank: 6, user_id: "6", name: "Fernanda Rocha", xp: 4800, level: 13, league: "gold", change: "up", streak: 22 },
    { rank: 7, user_id: "7", name: "Lucas Mendes", xp: 4500, level: 12, league: "gold", change: "down", streak: 14 },
    { rank: 8, user_id: "8", name: "Você", xp: 4250, level: 12, league: "gold", change: "up", streak: 15 },
    { rank: 9, user_id: "9", name: "Beatriz Alves", xp: 4000, level: 11, league: "gold", change: "down", streak: 12 },
    { rank: 10, user_id: "10", name: "Rafael Oliveira", xp: 3800, level: 11, league: "gold", change: "same", streak: 10 },
  ]);

  const [achievements] = useState<Achievement[]>([
    { id: "1", name: "Primeiro Passo", description: "Complete seu primeiro feedback", icon: "🎯", category: "Feedback", xp_reward: 50, coin_reward: 10, rarity: "common", unlocked: true, unlocked_at: "2024-01-15" },
    { id: "2", name: "Feedback Master", description: "Envie 50 feedbacks", icon: "💬", category: "Feedback", xp_reward: 500, coin_reward: 100, rarity: "epic", unlocked: true, unlocked_at: "2024-06-20" },
    { id: "3", name: "Streak Champion", description: "Mantenha 30 dias consecutivos", icon: "🔥", category: "Engajamento", xp_reward: 300, coin_reward: 50, rarity: "rare", unlocked: false, progress: 15, max_progress: 30 },
    { id: "4", name: "OKR Achiever", description: "Atinja 100% em um OKR", icon: "🎯", category: "Performance", xp_reward: 200, coin_reward: 40, rarity: "rare", unlocked: true, unlocked_at: "2024-09-15" },
    { id: "5", name: "Mentor do Ano", description: "Seja mentor de 5 colaboradores", icon: "🌟", category: "Liderança", xp_reward: 1000, coin_reward: 200, rarity: "legendary", unlocked: false, progress: 2, max_progress: 5 },
    { id: "6", name: "Aprendiz Dedicado", description: "Complete 10 trilhas de aprendizado", icon: "📚", category: "Aprendizado", xp_reward: 400, coin_reward: 80, rarity: "epic", unlocked: false, progress: 6, max_progress: 10 },
    { id: "7", name: "Colaborador do Mês", description: "Seja reconhecido como destaque", icon: "🏆", category: "Reconhecimento", xp_reward: 500, coin_reward: 100, rarity: "epic", unlocked: true, unlocked_at: "2024-11-01" },
    { id: "8", name: "Lenda Viva", description: "Alcance o nível 50", icon: "👑", category: "Nível", xp_reward: 5000, coin_reward: 1000, rarity: "legendary", unlocked: false, progress: 12, max_progress: 50 },
  ]);

  const [shopItems] = useState<ShopItem[]>([
    { id: "1", name: "Dia de Folga", description: "1 dia extra de folga", category: "Benefícios", price_coins: 5000, is_available: true },
    { id: "2", name: "Vale Presente R$100", description: "Vale para usar em lojas parceiras", category: "Vales", price_coins: 2000, stock: 10, is_available: true },
    { id: "3", name: "Almoço com CEO", description: "Almoço exclusivo com a liderança", category: "Experiências", price_coins: 3000, stock: 2, is_available: true },
    { id: "4", name: "Curso Online Premium", description: "Acesso a curso de sua escolha", category: "Aprendizado", price_coins: 1500, is_available: true },
    { id: "5", name: "Kit Home Office", description: "Mouse, teclado e mousepad", category: "Produtos", price_coins: 2500, stock: 5, is_available: true },
    { id: "6", name: "Badge Exclusivo", description: "Badge raro para seu perfil", category: "Digital", price_coins: 500, is_available: true },
    { id: "7", name: "Estacionamento VIP", description: "1 mês de vaga preferencial", category: "Benefícios", price_coins: 1000, stock: 3, is_available: true },
    { id: "8", name: "Mentoria Premium", description: "3 sessões com coach externo", category: "Desenvolvimento", price_coins: 4000, stock: 2, is_available: true },
  ]);

  const currentLeague = LEAGUES.find(l => l.id === userStats.league)!;
  const nextLeague = LEAGUES[LEAGUES.indexOf(currentLeague) + 1];
  const progressToNext = nextLeague 
    ? ((userStats.xp - currentLeague.min_xp) / (nextLeague.min_xp - currentLeague.min_xp)) * 100 
    : 100;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "bg-gray-500";
      case "rare": return "bg-blue-500";
      case "epic": return "bg-purple-500";
      case "legendary": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4 text-center">
            <Zap className="h-6 w-6 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{userStats.xp.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">XP Total</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
          <CardContent className="p-4 text-center">
            <Gift className="h-6 w-6 mx-auto mb-1 text-yellow-500" />
            <p className="text-2xl font-bold">{userStats.coins.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Moedas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 mx-auto mb-1 text-purple-500" />
            <p className="text-2xl font-bold">{userStats.level}</p>
            <p className="text-xs text-muted-foreground">Nível</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
          <CardContent className="p-4 text-center">
            <Flame className="h-6 w-6 mx-auto mb-1 text-orange-500" />
            <p className="text-2xl font-bold">{userStats.streak}</p>
            <p className="text-xs text-muted-foreground">Dias Seguidos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5">
          <CardContent className="p-4 text-center">
            <Trophy className="h-6 w-6 mx-auto mb-1 text-cyan-500" />
            <p className="text-2xl font-bold">#{userStats.rank}</p>
            <p className="text-xs text-muted-foreground">Ranking</p>
          </CardContent>
        </Card>
      </div>

      {/* League Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentLeague.icon}</span>
              <span className={`font-bold ${currentLeague.color}`}>{currentLeague.name}</span>
            </div>
            {nextLeague && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>Próxima: {nextLeague.icon} {nextLeague.name}</span>
                <span className="text-sm">({nextLeague.min_xp - userStats.xp} XP restantes)</span>
              </div>
            )}
          </div>
          <Progress value={progressToNext} className="h-3" />
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>{currentLeague.min_xp} XP</span>
            <span>{userStats.xp} XP</span>
            {nextLeague && <span>{nextLeague.min_xp} XP</span>}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="leaderboard" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="leaderboard" className="gap-2">
            <Trophy className="h-4 w-4" />
            Ranking
          </TabsTrigger>
          <TabsTrigger value="leagues" className="gap-2">
            <Crown className="h-4 w-4" />
            Ligas
          </TabsTrigger>
          <TabsTrigger value="achievements" className="gap-2">
            <Award className="h-4 w-4" />
            Conquistas
          </TabsTrigger>
          <TabsTrigger value="shop" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Loja
          </TabsTrigger>
        </TabsList>

        {/* Leaderboard */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Ranking Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.user_id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      entry.name === "Você" ? "bg-primary/10 border border-primary/30" : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 text-center font-bold">
                        {entry.rank <= 3 ? (
                          <span className="text-lg">
                            {entry.rank === 1 && "🥇"}
                            {entry.rank === 2 && "🥈"}
                            {entry.rank === 3 && "🥉"}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">#{entry.rank}</span>
                        )}
                      </div>
                      
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={entry.avatar} />
                        <AvatarFallback>{entry.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {entry.name}
                          {entry.streak >= 30 && <Flame className="h-4 w-4 text-orange-500" />}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Nível {entry.level} • {LEAGUES.find(l => l.id === entry.league)?.icon}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">{entry.xp.toLocaleString()} XP</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Flame className="h-3 w-3" />
                          {entry.streak} dias
                        </div>
                      </div>

                      <div className="w-6">
                        {entry.change === "up" && <ChevronUp className="h-5 w-5 text-green-500" />}
                        {entry.change === "down" && <ChevronDown className="h-5 w-5 text-red-500" />}
                        {entry.change === "same" && <Minus className="h-5 w-5 text-muted-foreground" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leagues */}
        <TabsContent value="leagues">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LEAGUES.map((league) => {
              const isCurrentLeague = league.id === userStats.league;
              const isUnlocked = userStats.xp >= league.min_xp;

              return (
                <Card 
                  key={league.id} 
                  className={`relative ${isCurrentLeague ? "border-2 border-primary" : ""} ${!isUnlocked ? "opacity-60" : ""}`}
                >
                  {isCurrentLeague && (
                    <Badge className="absolute -top-2 -right-2">Atual</Badge>
                  )}
                  <CardContent className="p-6 text-center">
                    <span className="text-5xl">{league.icon}</span>
                    <h3 className={`text-xl font-bold mt-2 ${league.color}`}>{league.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {league.min_xp.toLocaleString()} - {league.max_xp === Infinity ? "∞" : league.max_xp.toLocaleString()} XP
                    </p>

                    <div className="mt-4 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Benefícios:</p>
                      {league.perks.map((perk, i) => (
                        <p key={i} className="text-sm flex items-center justify-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          {perk}
                        </p>
                      ))}
                    </div>

                    {!isUnlocked && (
                      <div className="mt-4 flex items-center justify-center gap-1 text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        <span className="text-sm">Faltam {league.min_xp - userStats.xp} XP</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Achievements */}
        <TabsContent value="achievements">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card 
                key={achievement.id} 
                className={`relative ${!achievement.unlocked ? "opacity-70" : ""}`}
              >
                <div className={`absolute top-0 right-0 w-2 h-full rounded-r-lg ${getRarityColor(achievement.rarity)}`} />
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`text-3xl ${!achievement.unlocked ? "grayscale" : ""}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{achievement.name}</h3>
                        {achievement.unlocked && <Check className="h-4 w-4 text-green-500" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          {achievement.xp_reward} XP
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Gift className="h-3 w-3 mr-1" />
                          {achievement.coin_reward}
                        </Badge>
                      </div>

                      {!achievement.unlocked && achievement.progress !== undefined && (
                        <div className="mt-2">
                          <Progress 
                            value={(achievement.progress / achievement.max_progress!) * 100} 
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {achievement.progress}/{achievement.max_progress}
                          </p>
                        </div>
                      )}

                      {achievement.unlocked && achievement.unlocked_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Desbloqueado em {achievement.unlocked_at}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Shop */}
        <TabsContent value="shop">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">
              Suas moedas: <strong className="text-foreground">{userStats.coins.toLocaleString()}</strong>
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {shopItems.map((item) => {
              const canAfford = userStats.coins >= item.price_coins;

              return (
                <Card key={item.id} className={!canAfford ? "opacity-70" : ""}>
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                      <Gift className="h-12 w-12 text-muted-foreground" />
                    </div>

                    <Badge variant="outline" className="mb-2 text-xs">
                      {item.category}
                    </Badge>

                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>

                    {item.stock !== undefined && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Estoque: {item.stock} disponíveis
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold flex items-center gap-1">
                        <Gift className="h-4 w-4 text-yellow-500" />
                        {item.price_coins.toLocaleString()}
                      </span>
                      <Button 
                        size="sm" 
                        disabled={!canAfford}
                        variant={canAfford ? "default" : "secondary"}
                      >
                        {canAfford ? "Resgatar" : "Sem moedas"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
