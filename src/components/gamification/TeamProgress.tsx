import React, { memo, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, Star, Zap, Trophy, Target, Shield, Crown, Flame,
  TrendingUp, TrendingDown, Minus, Calendar, Award, Medal
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  level: number;
  xp: number;
  contribution: number;
  streak: number;
  achievements: number;
  trend: "up" | "down" | "stable";
}

interface TeamStats {
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  weeklyXp: number;
  rank: number;
  totalRank: number;
  members: TeamMember[];
  milestones: { name: string; progress: number; reward: number }[];
}

const mockTeam: TeamStats = {
  name: "Esquadrão Alpha",
  level: 12,
  xp: 45600,
  xpToNext: 50000,
  weeklyXp: 8750,
  rank: 3,
  totalRank: 15,
  members: [
    { id: "1", name: "Maria Santos", role: "Líder", level: 28, xp: 12500, contribution: 2800, streak: 15, achievements: 32, trend: "up" },
    { id: "2", name: "João Silva", role: "Membro", level: 24, xp: 9800, contribution: 2200, streak: 12, achievements: 25, trend: "up" },
    { id: "3", name: "Ana Costa", role: "Membro", level: 22, xp: 8400, contribution: 1900, streak: 8, achievements: 20, trend: "stable" },
    { id: "4", name: "Pedro Oliveira", role: "Membro", level: 20, xp: 7200, contribution: 1100, streak: 5, achievements: 18, trend: "down" },
    { id: "5", name: "Fernanda Lima", role: "Membro", level: 19, xp: 6500, contribution: 750, streak: 3, achievements: 15, trend: "up" }
  ],
  milestones: [
    { name: "XP Semanal", progress: 87, reward: 500 },
    { name: "Missões em Equipe", progress: 60, reward: 300 },
    { name: "Streak Coletivo", progress: 45, reward: 200 }
  ]
};

const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
  if (trend === "up") return <TrendingUp className="h-3 w-3 text-green-500" />;
  if (trend === "down") return <TrendingDown className="h-3 w-3 text-red-500" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
};

const MemberCard = memo(({ member, rank }: { member: TeamMember; rank: number }) => {
  const roleColors = {
    "Líder": "text-amber-500 bg-amber-500/20",
    "Membro": "text-blue-500 bg-blue-500/20"
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-3 rounded-lg bg-card border hover:bg-accent/30 transition-colors"
    >
      {/* Rank */}
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
        ${rank === 1 ? "bg-amber-500/20 text-amber-500" : 
          rank === 2 ? "bg-zinc-400/20 text-zinc-400" :
          rank === 3 ? "bg-orange-600/20 text-orange-600" : 
          "bg-muted text-muted-foreground"}
      `}>
        {rank}
      </div>
      
      {/* Avatar */}
      <Avatar className="h-10 w-10">
        <AvatarImage src={member.avatar} />
        <AvatarFallback className="text-sm">
          {member.name.split(" ").map(n => n[0]).join("")}
        </AvatarFallback>
      </Avatar>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{member.name}</span>
          <Badge className={`text-[10px] px-1 py-0 ${roleColors[member.role as keyof typeof roleColors] || ""}`}>
            {member.role}
          </Badge>
          <TrendIcon trend={member.trend} />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Nv.{member.level}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Flame className="h-3 w-3 text-orange-500" />
            {member.streak}d
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Trophy className="h-3 w-3 text-amber-500" />
            {member.achievements}
          </span>
        </div>
      </div>
      
      {/* Contribution */}
      <div className="text-right">
        <div className="font-bold text-sm text-primary">+{member.contribution}</div>
        <div className="text-[10px] text-muted-foreground">XP esta semana</div>
      </div>
    </motion.div>
  );
});

MemberCard.displayName = "MemberCard";

const TeamProgress = memo(({ className }: { className?: string }) => {
  const [team] = useState(mockTeam);
  
  const xpProgress = (team.xp / team.xpToNext) * 100;
  
  const sortedMembers = useMemo(() => {
    return [...team.members].sort((a, b) => b.contribution - a.contribution);
  }, [team.members]);
  
  const totalContribution = useMemo(() => {
    return team.members.reduce((sum, m) => sum + m.contribution, 0);
  }, [team.members]);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <Shield className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{team.name}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  Nível {team.level}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {team.members.length} membros • Rank #{team.rank} de {team.totalRank}
              </p>
            </div>
          </div>
          
          {/* Team Rank Badge */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/20">
            {team.rank <= 3 && <Crown className="h-4 w-4 text-amber-500" />}
            <span className="font-bold text-amber-500">#{team.rank}</span>
          </div>
        </div>
        
        {/* Team XP Progress */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progresso do Nível</span>
            <span className="text-muted-foreground">
              {team.xp.toLocaleString()} / {team.xpToNext.toLocaleString()} XP
            </span>
          </div>
          <Progress value={xpProgress} className="h-2.5" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500" />
              +{team.weeklyXp.toLocaleString()} XP esta semana
            </span>
            <span>{Math.round(100 - xpProgress)}% para o próximo nível</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="members">Membros</TabsTrigger>
            <TabsTrigger value="milestones">Metas</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="members" className="mt-4">
            <ScrollArea className="h-[280px] pr-4">
              <div className="space-y-2">
                {sortedMembers.map((member, idx) => (
                  <MemberCard key={member.id} member={member} rank={idx + 1} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="milestones" className="mt-4">
            <div className="space-y-4">
              {team.milestones.map((milestone, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 rounded-lg bg-muted/50 border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{milestone.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      <Star className="h-3 w-3 mr-1 text-amber-500" />
                      {milestone.reward} XP
                    </Badge>
                  </div>
                  <Progress value={milestone.progress} className="h-2 mb-1" />
                  <div className="text-xs text-muted-foreground text-right">
                    {milestone.progress}% completo
                  </div>
                </motion.div>
              ))}
              
              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h4 className="font-semibold">Próxima Recompensa</h4>
                <p className="text-sm text-muted-foreground">
                  Complete 1 meta para desbloquear bônus coletivo
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Zap className="h-6 w-6 mx-auto mb-1 text-amber-500" />
                <div className="text-xl font-bold">{totalContribution.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">XP Semanal</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Trophy className="h-6 w-6 mx-auto mb-1 text-purple-500" />
                <div className="text-xl font-bold">{team.members.reduce((sum, m) => sum + m.achievements, 0)}</div>
                <div className="text-xs text-muted-foreground">Conquistas</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Flame className="h-6 w-6 mx-auto mb-1 text-orange-500" />
                <div className="text-xl font-bold">{Math.round(team.members.reduce((sum, m) => sum + m.streak, 0) / team.members.length)}</div>
                <div className="text-xs text-muted-foreground">Streak Médio</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Medal className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                <div className="text-xl font-bold">{Math.round(team.members.reduce((sum, m) => sum + m.level, 0) / team.members.length)}</div>
                <div className="text-xs text-muted-foreground">Nível Médio</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 rounded-lg border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Bônus de Equipe Ativo</span>
              </div>
              <Badge className="bg-green-500/20 text-green-500">+15% XP</Badge>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" className="flex-1" size="sm">
            <Users className="h-4 w-4 mr-2" />
            Ver Equipe
          </Button>
          <Button className="flex-1" size="sm">
            <Target className="h-4 w-4 mr-2" />
            Missão em Grupo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

TeamProgress.displayName = "TeamProgress";

export { TeamProgress };
