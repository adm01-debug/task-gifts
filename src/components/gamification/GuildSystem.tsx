import React, { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Shield, Trophy, Star, Crown, Sword, 
  Target, Gift, MessageSquare, Settings, Plus,
  TrendingUp, Medal, Zap, Heart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface GuildMember {
  id: string;
  name: string;
  avatar?: string;
  role: "leader" | "officer" | "member";
  xp: number;
  level: number;
  weeklyContribution: number;
  isOnline: boolean;
}

interface Guild {
  id: string;
  name: string;
  description: string;
  emblem: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  memberCount: number;
  maxMembers: number;
  weeklyXP: number;
  rank: number;
  perks: string[];
  members: GuildMember[];
}

const mockGuild: Guild = {
  id: "1",
  name: "Os Inovadores",
  description: "Guilda focada em inovação e excelência",
  emblem: "🦅",
  level: 12,
  xp: 8500,
  xpToNextLevel: 10000,
  memberCount: 18,
  maxMembers: 25,
  weeklyXP: 4200,
  rank: 3,
  perks: ["+10% XP em grupo", "Sala privada", "Emblema exclusivo"],
  members: [
    { id: "1", name: "Carlos Silva", role: "leader", xp: 15000, level: 25, weeklyContribution: 850, isOnline: true },
    { id: "2", name: "Ana Santos", role: "officer", xp: 12000, level: 22, weeklyContribution: 720, isOnline: true },
    { id: "3", name: "Pedro Lima", role: "officer", xp: 11500, level: 21, weeklyContribution: 680, isOnline: false },
    { id: "4", name: "Maria Costa", role: "member", xp: 9000, level: 18, weeklyContribution: 450, isOnline: true },
    { id: "5", name: "João Oliveira", role: "member", xp: 8500, level: 17, weeklyContribution: 520, isOnline: false },
  ]
};

const guildChallenges = [
  { id: "1", title: "Maratona de Aprendizado", description: "Complete 50 módulos como guilda", progress: 35, target: 50, reward: 2000, icon: "📚" },
  { id: "2", title: "Espírito de Equipe", description: "Envie 100 kudos entre membros", progress: 78, target: 100, reward: 1500, icon: "🤝" },
  { id: "3", title: "Pontualidade Perfeita", description: "100% de pontualidade por 5 dias", progress: 3, target: 5, reward: 1000, icon: "⏰" },
];

const GuildMemberCard: React.FC<{ member: GuildMember; index: number }> = memo(({ member, index }) => {
  const roleIcons = {
    leader: Crown,
    officer: Shield,
    member: Users
  };
  const RoleIcon = roleIcons[member.role];
  
  const roleColors = {
    leader: "text-yellow-500",
    officer: "text-blue-500",
    member: "text-muted-foreground"
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={member.avatar} />
          <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
        </Avatar>
        {member.isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{member.name}</span>
          <RoleIcon className={cn("h-4 w-4", roleColors[member.role])} />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Nível {member.level}</span>
          <span>•</span>
          <span>+{member.weeklyContribution} XP/sem</span>
        </div>
      </div>
      
      <Badge variant="outline" className="shrink-0">
        #{index + 1}
      </Badge>
    </motion.div>
  );
});

GuildMemberCard.displayName = "GuildMemberCard";

const GuildChallengeCard: React.FC<{ challenge: typeof guildChallenges[0]; index: number }> = memo(({ challenge, index }) => {
  const progressPercent = (challenge.progress / challenge.target) * 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{challenge.icon}</span>
        <div className="flex-1">
          <h4 className="font-semibold">{challenge.title}</h4>
          <p className="text-sm text-muted-foreground">{challenge.description}</p>
          
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span>{challenge.progress}/{challenge.target}</span>
              <span className="text-primary">+{challenge.reward} XP</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </div>
      </div>
    </motion.div>
  );
});

GuildChallengeCard.displayName = "GuildChallengeCard";

export const GuildSystem: React.FC<{ className?: string }> = memo(({ className }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const guild = mockGuild;
  const levelProgress = (guild.xp / guild.xpToNextLevel) * 100;

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Guild Header */}
      <div className="relative p-6 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
        <div className="flex items-start gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-4xl shadow-lg"
          >
            {guild.emblem}
          </motion.div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{guild.name}</h2>
              <Badge className="bg-yellow-500/20 text-yellow-600">
                <Trophy className="h-3 w-3 mr-1" />
                #{guild.rank}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">{guild.description}</p>
            
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{guild.memberCount}/{guild.maxMembers}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Nível {guild.level}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span>+{guild.weeklyXP} XP/sem</span>
              </div>
            </div>
          </div>
          
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Level Progress */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso para Nível {guild.level + 1}</span>
            <span>{guild.xp.toLocaleString()}/{guild.xpToNextLevel.toLocaleString()} XP</span>
          </div>
          <Progress value={levelProgress} className="h-3" />
        </div>
        
        {/* Perks */}
        <div className="flex flex-wrap gap-2 mt-4">
          {guild.perks.map((perk, i) => (
            <Badge key={i} variant="secondary" className="bg-background/50">
              <Zap className="h-3 w-3 mr-1 text-yellow-500" />
              {perk}
            </Badge>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="members">Membros</TabsTrigger>
          <TabsTrigger value="challenges">Desafios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Ranking", value: `#${guild.rank}`, icon: Trophy, color: "text-yellow-500" },
              { label: "Membros", value: guild.memberCount, icon: Users, color: "text-blue-500" },
              { label: "XP Semanal", value: `+${guild.weeklyXP}`, icon: TrendingUp, color: "text-green-500" },
              { label: "Desafios", value: "3 ativos", icon: Target, color: "text-purple-500" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-xl bg-muted/30 text-center"
              >
                <stat.icon className={cn("h-6 w-6 mx-auto mb-2", stat.color)} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Medal className="h-5 w-5 text-yellow-500" />
                Top Contribuidores da Semana
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {guild.members.slice(0, 3).map((member, i) => (
                <GuildMemberCard key={member.id} member={member} index={i} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-muted-foreground">
              {guild.memberCount} membros • {guild.members.filter(m => m.isOnline).length} online
            </span>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Convidar
            </Button>
          </div>
          <div className="space-y-2">
            {guild.members.map((member, i) => (
              <GuildMemberCard key={member.id} member={member} index={i} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="mt-4 space-y-4">
          {guildChallenges.map((challenge, i) => (
            <GuildChallengeCard key={challenge.id} challenge={challenge} index={i} />
          ))}
        </TabsContent>
      </Tabs>
    </Card>
  );
});

GuildSystem.displayName = "GuildSystem";
